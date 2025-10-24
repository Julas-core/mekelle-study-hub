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
import { Upload as UploadIcon } from 'lucide-react';
import { BulkUploadMaterial } from '@/components/BulkUploadMaterial';
import { trackUpload } from '@/hooks/useAnalytics';
import { MEKELLE_UNIVERSITY_COLLEGES } from '@/constants/colleges';

interface MaterialMetadata {
  file: File;
  courseCode: string;
  title: string;
  description: string;
  generating: boolean;
}

const Upload = () => {
  const [college, setCollege] = useState('');
  const [materials, setMaterials] = useState<MaterialMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only administrators can upload materials.',
      });
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate, toast]);

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

    // Check if all materials have course codes and titles
    if (materials.some(m => !m.courseCode.trim() || !m.title.trim())) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide course codes and titles for all materials.',
      });
      return;
    }

    setUploading(true);

    try {
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
        const filePath = `${college}/${material.courseCode}/${Date.now()}_${material.file.name}`;
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
            department: college, // Keep using department field to maintain DB compatibility
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
      setCollege('');
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container max-w-2xl mx-auto py-8">
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
                <Label htmlFor="college">College *</Label>
                <Select value={college} onValueChange={setCollege} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEKELLE_UNIVERSITY_COLLEGES.map((college) => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {college && (
                <BulkUploadMaterial
                  department={college} // Use college value but keep prop name to maintain compatibility
                  onMaterialsChange={setMaterials}
                />
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
