import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MEKELLE_UNIVERSITY_SCHOOLS } from '@/constants/colleges';
import { Users } from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  department: string;
  course: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

const StudyGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    course: '',
  });

  const fetchGroups = async () => {
    const { data } = await supabase
      .from('study_groups')
      .select(`
        *,
        study_group_members(count)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      const groupsWithCounts = await Promise.all(
        data.map(async (group) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { data: membership } = await supabase
            .from('study_group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', user?.id || '')
            .maybeSingle();

          return {
            ...group,
            member_count: count || 0,
            is_member: !!membership,
          };
        })
      );
      setGroups(groupsWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: 'destructive', title: 'Sign in required' });
      return;
    }

    const { data: group, error } = await supabase
      .from('study_groups')
      .insert({
        ...formData,
        created_by: user.id,
      })
      .select()
      .single();

    if (!error && group) {
      // Auto-join creator
      await supabase.from('study_group_members').insert({
        group_id: group.id,
        user_id: user.id,
        role: 'admin',
      });

      toast({ title: 'Study group created!' });
      setOpen(false);
      setFormData({ name: '', description: '', department: '', course: '' });
      fetchGroups();
    } else {
      toast({ variant: 'destructive', title: 'Failed to create group' });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Sign in required' });
      return;
    }

    const { error } = await supabase.from('study_group_members').insert({
      group_id: groupId,
      user_id: user.id,
    });

    if (!error) {
      toast({ title: 'Joined study group!' });
      fetchGroups();
    } else {
      toast({ variant: 'destructive', title: 'Failed to join group' });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (!error) {
      toast({ title: 'Left study group' });
      fetchGroups();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground mt-2">
            Join or create study groups to collaborate with classmates
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>
                Start a new study group for your course
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEKELLE_UNIVERSITY_SCHOOLS).flatMap(([school, departments]) =>
                      departments.map((dept) => (
                        <SelectItem key={`${school}-${dept}`} value={dept}>
                          {dept}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Create Group</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading groups...</p>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No study groups yet. Be the first to create one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.department} • {group.course}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {group.member_count} members
                  </span>
                  {group.is_member ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      Leave
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
