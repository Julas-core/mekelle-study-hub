import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Lock, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  visibility: 'private' | 'study_group' | 'public';
  created_at: string;
  material_id?: string;
  materials?: {
    title: string;
    course: string;
  };
}

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    visibility: 'private' | 'study_group' | 'public';
    material_id: string;
  }>({
    title: '',
    content: '',
    visibility: 'private',
    material_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('study_notes')
      .select(`
        *,
        materials (title, course)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load notes');
    } else {
      setNotes((data || []) as Note[]);
    }
  };

  const saveNote = async () => {
    if (!user || !newNote.title || !newNote.content) {
      toast.error('Please fill in title and content');
      return;
    }

    if (editMode && selectedNote) {
      const { error } = await supabase
        .from('study_notes')
        .update({
          title: newNote.title,
          content: newNote.content,
          visibility: newNote.visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedNote.id);

      if (error) {
        toast.error('Failed to update note');
      } else {
        toast.success('Note updated!');
        resetForm();
        fetchNotes();
      }
    } else {
      const { error } = await supabase
        .from('study_notes')
        .insert({
          user_id: user.id,
          title: newNote.title,
          content: newNote.content,
          visibility: newNote.visibility,
          material_id: newNote.material_id || null
        });

      if (error) {
        toast.error('Failed to create note');
      } else {
        toast.success('Note created!');
        resetForm();
        fetchNotes();
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from('study_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      toast.error('Failed to delete note');
    } else {
      toast.success('Note deleted');
      fetchNotes();
      setSelectedNote(null);
    }
  };

  const resetForm = () => {
    setNewNote({ title: '', content: '', visibility: 'private', material_id: '' });
    setDialogOpen(false);
    setEditMode(false);
    setSelectedNote(null);
  };

  const openEditDialog = (note: Note) => {
    setSelectedNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      visibility: note.visibility,
      material_id: note.material_id || ''
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const getVisibilityIcon = (visibility: string) => {
    if (visibility === 'private') return <Lock className="h-4 w-4" />;
    if (visibility === 'study_group') return <Users className="h-4 w-4" />;
    return <Eye className="h-4 w-4" />;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Please sign in to use Study Notes</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Notes</h1>
            <p className="text-muted-foreground">Create and organize your study notes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                <Textarea
                  placeholder="Write your notes here... (Markdown supported)"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={15}
                />
                <Select value={newNote.visibility} onValueChange={(v: any) => setNewNote({ ...newNote, visibility: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="study_group">Share with Study Group</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={saveNote} className="flex-1">
                    {editMode ? 'Update Note' : 'Save Note'}
                  </Button>
                  {editMode && (
                    <Button variant="destructive" onClick={() => selectedNote && deleteNote(selectedNote.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openEditDialog(note)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                  {getVisibilityIcon(note.visibility)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
                {note.materials && (
                  <Badge variant="secondary" className="text-xs">
                    {note.materials.course}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {notes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No notes yet. Create your first study note!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notes;
