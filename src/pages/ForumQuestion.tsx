import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ThumbsUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  content: string;
  course: string;
  department: string;
  upvotes: number;
  views: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Answer {
  id: string;
  content: string;
  upvotes: number;
  is_accepted: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

const ForumQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuestion();
      fetchAnswers();
      incrementViews();
    }
  }, [id]);

  const fetchQuestion = async () => {
    const { data: questionData, error: questionError } = await supabase
      .from('forum_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (questionError || !questionData) {
      toast.error('Failed to load question');
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', questionData.user_id)
      .single();

    setQuestion({ ...questionData, profiles: profileData || undefined });
    setLoading(false);
  };

  const fetchAnswers = async () => {
    const { data: answersData, error } = await supabase
      .from('forum_answers')
      .select('*')
      .eq('question_id', id)
      .order('is_accepted', { ascending: false })
      .order('upvotes', { ascending: false });

    if (!error && answersData) {
      const answersWithProfiles = await Promise.all(
        answersData.map(async (answer: any) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', answer.user_id)
            .single();
          return { ...answer, profiles: profileData || undefined };
        })
      );
      setAnswers(answersWithProfiles);
    }
  };

  const incrementViews = async () => {
    if (!question) return;
    await supabase
      .from('forum_questions')
      .update({ views: question.views + 1 })
      .eq('id', id);
  };

  const submitAnswer = async () => {
    if (!user || !newAnswer.trim()) return;

    const { error } = await supabase
      .from('forum_answers')
      .insert({
        question_id: id,
        user_id: user.id,
        content: newAnswer.trim()
      });

    if (error) {
      toast.error('Failed to post answer');
    } else {
      toast.success('Answer posted!');
      setNewAnswer('');
      fetchAnswers();
    }
  };

  const upvoteQuestion = async () => {
    if (!user || !question) return;

    const { error } = await supabase
      .from('forum_upvotes')
      .insert({ user_id: user.id, question_id: question.id });

    if (error) {
      if (error.code === '23505') {
        toast.error('Already upvoted');
      }
    } else {
      await supabase
        .from('forum_questions')
        .update({ upvotes: question.upvotes + 1 })
        .eq('id', question.id);
      fetchQuestion();
    }
  };

  const upvoteAnswer = async (answerId: string, currentUpvotes: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('forum_upvotes')
      .insert({ user_id: user.id, answer_id: answerId });

    if (error) {
      if (error.code === '23505') {
        toast.error('Already upvoted');
      }
    } else {
      await supabase
        .from('forum_answers')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', answerId);
      fetchAnswers();
    }
  };

  const acceptAnswer = async (answerId: string) => {
    if (!user || !question || question.user_id !== user.id) return;

    await supabase
      .from('forum_answers')
      .update({ is_accepted: false })
      .eq('question_id', question.id);

    const { error } = await supabase
      .from('forum_answers')
      .update({ is_accepted: true })
      .eq('id', answerId);

    if (error) {
      toast.error('Failed to accept answer');
    } else {
      toast.success('Answer accepted!');
      fetchAnswers();
    }
  };

  if (loading || !question) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/forum')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-4">{question.title}</CardTitle>
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">{question.course}</Badge>
                  <Badge variant="outline">{question.department}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 mb-4">
              <Avatar>
                <AvatarImage src={question.profiles?.avatar_url} />
                <AvatarFallback>{question.profiles?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{question.profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(question.created_at).toLocaleDateString()}
                </p>
              </div>
              {user && (
                <Button variant="outline" size="sm" onClick={upvoteQuestion}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {question.upvotes}
                </Button>
              )}
            </div>
            <p className="whitespace-pre-wrap">{question.content}</p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">{answers.length} Answers</h2>

        <div className="space-y-4 mb-6">
          {answers.map((answer) => (
            <Card key={answer.id} className={answer.is_accepted ? 'border-green-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={answer.profiles?.avatar_url} />
                    <AvatarFallback>{answer.profiles?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{answer.profiles?.full_name}</p>
                      {answer.is_accepted && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(answer.created_at).toLocaleDateString()}
                    </p>
                    <p className="whitespace-pre-wrap mb-4">{answer.content}</p>
                    <div className="flex gap-2">
                      {user && (
                        <Button variant="outline" size="sm" onClick={() => upvoteAnswer(answer.id, answer.upvotes)}>
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {answer.upvotes}
                        </Button>
                      )}
                      {user && question.user_id === user.id && !answer.is_accepted && (
                        <Button variant="outline" size="sm" onClick={() => acceptAnswer(answer.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Answer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your answer..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={6}
                className="mb-4"
              />
              <Button onClick={submitAnswer}>Post Answer</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Please sign in to post an answer</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForumQuestion;
