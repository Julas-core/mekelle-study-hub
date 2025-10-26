import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon } from "lucide-react";
import { UserPointsBadge } from "@/components/UserPointsBadge";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, department, student_id, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          
          if (data) {
            setFullName(data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '');
            setDepartment(data.department || '');
            setStudentId(data.student_id || '');
            setAvatarUrl(data.avatar_url);
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load profile data',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const fileName = `${user!.id}/${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        if (!data) {
          throw new Error("Could not get public URL for avatar.");
        }
        
        setAvatarUrl(data.publicUrl);

        // Notify other parts of the app (e.g. Header) about the updated avatar
        try {
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { avatarUrl: data.publicUrl } }));
        } catch (e) {
          // ignore in environments that don't support CustomEvent
        }

        // Also update the profile record
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user!.id);

        if (updateError) {
          throw updateError;
        }

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: error.message || 'Failed to upload avatar.',
        });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          email: email,
          department: department,
          student_id: studentId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Notify other parts of the app about profile changes (avatarUrl may be null)
      try {
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: { avatarUrl } }));
      } catch (e) {
        // ignore
      }

      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="User Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    disabled={!isEditing || uploading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isEditing || uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your department"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student/Employee ID</Label>
                  <Input 
                    id="studentId" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your ID"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {!isEditing ? (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    disabled={saving}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={saving || uploading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving || uploading}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </form>

            <div className="border-t mt-6 pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Points</h3>
                <UserPointsBadge userId={user.id} variant="large" />
                <p className="text-xs text-muted-foreground mt-2">
                  Earn points by uploading materials, downloading, and rating content!
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Account Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">User ID:</span> {user.id}</p>
                  <p><span className="font-medium">Status:</span> Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
