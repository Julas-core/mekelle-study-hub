import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Plus, CheckCircle, Circle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { MEKELLE_UNIVERSITY_SCHOOLS } from '@/constants/colleges';

interface ExamTopic {
  id: string;
  topic_name: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

const ExamPrep = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ExamTopic[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedCourse && selectedDepartment) {
      fetchTopics();
    }
  }, [user, selectedCourse, selectedDepartment]);

  const fetchTopics = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('exam_topics')
      .select('*')
      .eq('user_id', user.id)
      .eq('course', selectedCourse)
      .eq('department', selectedDepartment)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load topics');
    } else {
      setTopics((data || []) as ExamTopic[]);
    }
    setLoading(false);
  };

  const addTopic = async () => {
    if (!user || !newTopic.trim() || !selectedCourse || !selectedDepartment) return;

    const { error } = await supabase
      .from('exam_topics')
      .insert({
        user_id: user.id,
        course: selectedCourse,
        department: selectedDepartment,
        topic_name: newTopic.trim(),
        status: 'not_started'
      });

    if (error) {
      toast.error('Failed to add topic');
    } else {
      setNewTopic('');
      fetchTopics();
      toast.success('Topic added!');
    }
  };

  const updateTopicStatus = async (topicId: string, newStatus: string) => {
    const { error } = await supabase
      .from('exam_topics')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', topicId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      fetchTopics();
    }
  };

  const calculateProgress = () => {
    if (topics.length === 0) return 0;
    const completed = topics.filter(t => t.status === 'completed').length;
    return Math.round((completed / topics.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'in_progress') return <Clock className="h-5 w-5 text-yellow-500" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Please sign in to use Exam Prep Tracker</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Exam Preparation Tracker</h1>
        <p className="text-muted-foreground mb-6">Track your exam preparation progress</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
              placeholder="Enter course name"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            />
          </CardContent>
        </Card>

        {selectedCourse && selectedDepartment && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={calculateProgress()} className="h-3" />
                  <p className="text-sm text-muted-foreground text-right">
                    {topics.filter(t => t.status === 'completed').length} of {topics.length} topics completed ({calculateProgress()}%)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter topic name"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                  />
                  <Button onClick={addTopic}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topics Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {topics.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No topics added yet. Add your first topic above!</p>
                ) : (
                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <div key={topic.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Checkbox
                          checked={topic.status === 'completed'}
                          onCheckedChange={(checked) => {
                            updateTopicStatus(topic.id, checked ? 'completed' : 'not_started');
                          }}
                        />
                        {getStatusIcon(topic.status)}
                        <span className={`flex-1 ${topic.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {topic.topic_name}
                        </span>
                        <Select
                          value={topic.status}
                          onValueChange={(value) => updateTopicStatus(topic.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamPrep;
