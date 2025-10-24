import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload as UploadIcon, Loader2, Sparkles } from 'lucide-react';
import { trackUpload } from '@/hooks/useAnalytics';
import { MEKELLE_UNIVERSITY_SCHOOLS } from '@/constants/colleges';

interface MaterialMetadata {
  file: File;
  courseCode: string;
  title: string;
  description: string;
  school: string;
  department: string;
  generating: boolean;
}

const Upload = () => {
  const [materials, setMaterials] = useState<MaterialMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be signed in to upload materials.',
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;

    const newMaterials: MaterialMetadata[] = Array.from(files).map(file => ({
      file,
      courseCode: '',
      title: '',
      description: '',
      school: '',
      department: '',
      generating: false, // Don't start generating until school and department are selected
    }));

    setMaterials(prev => [...prev, ...newMaterials]);
  };

  const updateMaterial = (index: number, field: 'school' | 'department', value: string) => {
    setMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If both school and department are selected, trigger AI metadata generation
      if (field === 'department' && value && updated[index].school) {
        updated[index].generating = true;
        generateMetadata(index, updated[index].school, value, updated[index].file);
      }
      
      return updated;
    });
  };

  const generateMetadata = async (index: number, school: string, department: string, file: File) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-material-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          department: department, // Using department as school info is already separated
        }),
      });

      if (response.ok) {
        const { courseCode, title, description } = await response.json();
        setMaterials(prev => {
          const updated = [...prev];
          if (index < updated.length) {
            updated[index] = { 
              ...updated[index], 
              courseCode, 
              title, 
              description, 
              generating: false 
            };
          }
          return updated;
        });
      } else {
        throw new Error('Failed to generate metadata');
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      setMaterials(prev => {
        const updated = [...prev];
        if (index < updated.length) {
          updated[index] = { 
            ...updated[index],
            title: file.name, 
            description: '', 
            generating: false 
          };
        }
        return updated;
      });
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return 'PDF';
    if (['doc', 'docx'].includes(ext || '')) return 'DOC';
    if (['ppt', 'pptx'].includes(ext || '')) return 'PPT';
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return 'VIDEO';
    return 'OTHER';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (materials.length === 0 || !user) return;

    // Check if any material is still generating
    if (materials.some(m => m.generating)) {
      toast({
        variant: 'destructive',
        title: 'Please Wait',
        description: 'AI is still generating metadata for some files.',
      });
      return;
    }

    // Check if all materials have school, department, course codes and titles
    if (materials.some(m => !m.school.trim() || !m.department.trim() || !m.courseCode.trim() || !m.title.trim())) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide school, department, course codes and titles for all materials.',
      });
      return;
    }

    setUploading(true);

    try {
      // Check for duplicates using AI
      const materialsWithDuplicates = [];
      for (const material of materials) {
        const hasDuplicate = await checkForDuplicate(material);
        if (hasDuplicate) {
          materialsWithDuplicates.push(material);
        }
      }

      // If duplicates are found, show user a message and ask for confirmation
      if (materialsWithDuplicates.length > 0) {
        const duplicateNames = materialsWithDuplicates.map(m => m.title).join(', ');
        const shouldContinue = window.confirm(
          `Duplicate materials detected: ${duplicateNames}. Are you sure you want to proceed with upload?`
        );
        
        if (!shouldContinue) {
          setUploading(false);
          return;
        }
      }

      // Get user profile once
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const uploadedBy = profile?.full_name || user.email || 'Unknown';
      
      // Upload all materials
      for (const material of materials) {
        // Upload file to storage
        const filePath = `${material.school}/${material.department}/${material.courseCode}/${Date.now()}_${material.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, material.file);

        if (uploadError) throw uploadError;

        // Create material record
        const { error: insertError } = await supabase
          .from('materials')
          .insert({
            title: material.title,
            description: material.description,
            department: material.department, // Store the selected department
            course: material.courseCode,
            file_type: getFileType(material.file.name),
            file_path: filePath,
            file_size: formatFileSize(material.file.size),
            uploaded_by: uploadedBy,
            uploaded_by_user_id: user.id,
          });

        if (insertError) throw insertError;
        
        // Track the upload event
        trackUpload(material.title);
      }

      toast({
        title: 'Success!',
        description: `${materials.length} material(s) uploaded successfully.`,
      });

      // Reset form
      setMaterials([]);
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload materials',
      });
    } finally {
      setUploading(false);
    }
  };

  const checkForDuplicate = async (material: MaterialMetadata): Promise<boolean> => {
    try {
      // Use AI to determine if this material already exists in the database
      // by comparing title, course, and department information
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-duplicate-material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          title: material.title,
          course: material.courseCode,
          department: material.department,
          school: material.school,
          fileName: material.file.name,
          fileSize: material.file.size,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isDuplicate || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false; // If there's an error, continue with the upload to be safe
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-6 w-6" />
              Upload Course Material
            </CardTitle>
            <CardDescription>
              Add new materials for students to access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="files">Select Files</Label>
                <Input
                  id="files"
                  type="file"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
                />
                <p className="text-sm text-muted-foreground">
                  Select multiple files to upload
                </p>
              </div>

              {materials.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Selected Materials ({materials.length})
                  </div>
                  
                  {materials.map((material, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{material.file.name}</p>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(material.file.size)})
                            </span>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMaterial(index)}
                            disabled={material.generating}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`school-${index}`}>School *</Label>
                            <Select 
                              value={material.school} 
                              onValueChange={(value) => updateMaterial(index, 'school', value)} 
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select school" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(MEKELLE_UNIVERSITY_SCHOOLS).map((schoolName) => (
                                  <SelectItem key={schoolName} value={schoolName}>{schoolName}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`department-${index}`}>Department *</Label>
                            <Select 
                              value={material.department} 
                              onValueChange={(value) => updateMaterial(index, 'department', value)} 
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {material.school ? 
                                  (MEKELLE_UNIVERSITY_SCHOOLS[material.school as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS] || []).map((dept) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  )) : 
                                  Object.values(MEKELLE_UNIVERSITY_SCHOOLS).flat().map((dept, idx) => (
                                    <SelectItem key={idx} value={dept}>{dept}</SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {material.generating && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating metadata with AI...
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={uploading || materials.length === 0 || materials.some(m => m.generating)} 
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : `Upload ${materials.length} Material(s)`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
