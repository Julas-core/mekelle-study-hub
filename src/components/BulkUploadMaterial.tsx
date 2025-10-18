import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Loader2, Sparkles } from 'lucide-react';

interface MaterialMetadata {
  file: File;
  title: string;
  description: string;
  generating: boolean;
}

interface BulkUploadMaterialProps {
  department: string;
  course: string;
  onMaterialsChange: (materials: MaterialMetadata[]) => void;
}

export const BulkUploadMaterial = ({ department, course, onMaterialsChange }: BulkUploadMaterialProps) => {
  const [materials, setMaterials] = useState<MaterialMetadata[]>([]);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;

    const newMaterials: MaterialMetadata[] = Array.from(files).map(file => ({
      file,
      title: '',
      description: '',
      generating: true,
    }));

    setMaterials(prev => [...prev, ...newMaterials]);
    onMaterialsChange([...materials, ...newMaterials]);

    // Generate metadata for each file
    for (let i = 0; i < newMaterials.length; i++) {
      const material = newMaterials[i];
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-material-metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            fileName: material.file.name,
            department,
            course,
          }),
        });

        if (response.ok) {
          const { title, description } = await response.json();
          const updatedMaterial = { ...material, title, description, generating: false };
          
          setMaterials(prev => {
            const updated = [...prev];
            const index = updated.findIndex(m => m.file === material.file);
            if (index !== -1) {
              updated[index] = updatedMaterial;
            }
            onMaterialsChange(updated);
            return updated;
          });
        } else {
          throw new Error('Failed to generate metadata');
        }
      } catch (error) {
        console.error('Error generating metadata:', error);
        const updatedMaterial = { 
          ...material, 
          title: material.file.name, 
          description: '', 
          generating: false 
        };
        
        setMaterials(prev => {
          const updated = [...prev];
          const index = updated.findIndex(m => m.file === material.file);
          if (index !== -1) {
            updated[index] = updatedMaterial;
          }
          onMaterialsChange(updated);
          return updated;
        });
      }
    }
  };

  const updateMaterial = (index: number, field: 'title' | 'description', value: string) => {
    setMaterials(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      onMaterialsChange(updated);
      return updated;
    });
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onMaterialsChange(updated);
      return updated;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="files">Files *</Label>
        <Input
          id="files"
          type="file"
          onChange={(e) => handleFilesSelected(e.target.files)}
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov"
        />
        <p className="text-sm text-muted-foreground">
          Select multiple files to upload. AI will generate titles and descriptions.
        </p>
      </div>

      {materials.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Selected Materials ({materials.length})
          </div>
          
          {materials.map((material, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{material.file.name}</p>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(material.file.size)})
                      </span>
                      {material.generating && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`title-${index}`}>Title *</Label>
                      <Input
                        id={`title-${index}`}
                        value={material.title}
                        onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                        placeholder="Material title"
                        disabled={material.generating}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={material.description}
                        onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                        placeholder="Material description"
                        rows={2}
                        disabled={material.generating}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMaterial(index)}
                    disabled={material.generating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
