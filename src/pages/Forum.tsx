import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, ThumbsUp, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { MEKELLE_UNIVERSITY_SCHOOLS } from '@/constants/colleges';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  content: string;
  course: string;
  department: string;
  upvotes: number;
  views: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
  answer_count?: number;
}

const Forum = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', course: '', department: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [selectedDepartment, searchQuery]);

  const fetchQuestions = async () => {
    let query = supabase
      .from('forum_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedDepartment !== 'all') {
      query = query.eq('department', selectedDepartment);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load questions');
      setLoading(false);
      return;
    }

    // Get profiles and answer counts for each question
    const questionsWithData = await Promise.all(
      (data || []).map(async (q: any) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', q.user_id)
          .single();

        const { count } = await supabase
          .from('forum_answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id);

        return { ...q, profiles: profileData || undefined, answer_count: count || 0 };
      })
    );
    setQuestions(questionsWithData);
    setLoading(false);
  };

  const createQuestion = async () => {
    if (!user || !newQuestion.title || !newQuestion.content || !newQuestion.course || !newQuestion.department) {
      toast.error('Please fill all fields');
      return;
    }

    const { error } = await supabase
      .from('forum_questions')
      .insert({
        user_id: user.id,
        title: newQuestion.title,
        content: newQuestion.content,
        course: newQuestion.course,
        department: newQuestion.department
      });

    if (error) {
      toast.error('Failed to create question');
    } else {
      toast.success('Question posted!');
      setNewQuestion({ title: '', content: '', course: '', department: '' });
      setDialogOpen(false);
      fetchQuestions();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discussion Forum</h1>
            <p className="text-muted-foreground">Ask questions and help your peers</p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ask a Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Question title"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Describe your question in detail..."
                    value={newQuestion.content}
                    onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                    rows={6}
                  />
                  <Select value={newQuestion.department} onValueChange={(v) => setNewQuestion({ ...newQuestion, department: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(MEKELLE_UNIVERSITY_SCHOOLS).map(school => (
                        MEKELLE_UNIVERSITY_SCHOOLS[school as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS].map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Course name"
                    value={newQuestion.course}
                    onChange={(e) => setNewQuestion({ ...newQuestion, course: e.target.value })}
                  />
                  <Button onClick={createQuestion} className="w-full">Post Question</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Object.keys(MEKELLE_UNIVERSITY_SCHOOLS).map(school => (
                MEKELLE_UNIVERSITY_SCHOOLS[school as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS].map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading questions...</p>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/forum/${question.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{question.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {question.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {question.answer_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {question.views}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{question.course}</Badge>
                      <Badge variant="outline">{question.department}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
