import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MEKELLE_UNIVERSITY_SCHOOLS } from '@/constants/colleges';

interface ProfileCompletionModalProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

export default function ProfileCompletionModal({ open, userId, onComplete }: ProfileCompletionModalProps) {
  const [school, setSchool] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Avatar must be less than 5MB',
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
    }
  };

  const handleSubmit = async () => {
    if (!department.trim() || !studentId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in department and student ID',
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          department,
          student_id: studentId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Dispatch event to update avatar globally
      if (avatarUrl) {
        window.dispatchEvent(new CustomEvent('profile-updated', { 
          detail: { avatarUrl } 
        }));
      }

      toast({
        title: 'Profile Complete!',
        description: 'Your profile has been set up successfully.',
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Set up your profile to make uploading materials easier
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">Optional: Upload profile picture</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Select value={school} onValueChange={setSchool}>
              <SelectTrigger>
                <SelectValue placeholder="Select your school (optional)" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(MEKELLE_UNIVERSITY_SCHOOLS).map((schoolName) => (
                  <SelectItem key={schoolName} value={schoolName}>
                    {schoolName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                {school ? 
                  (MEKELLE_UNIVERSITY_SCHOOLS[school as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS] || []).map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  )) : 
                  Object.values(MEKELLE_UNIVERSITY_SCHOOLS).flat().map((dept, idx) => (
                    <SelectItem key={idx} value={dept}>{dept}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter your student ID"
              required
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={uploading} className="w-full">
          {uploading ? 'Saving...' : 'Complete Profile'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
