import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Send, User } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Material {
  id: string;
  title: string;
  course: string;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserMaterials();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchUserMaterials = async () => {
    const { data } = await supabase
      .from('materials')
      .select('id, title, course')
      .limit(50);

    if (data) {
      setMaterials(data);
    }
  };

  const createSession = async () => {
    if (!user || !selectedMaterial) return null;

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        user_id: user.id,
        material_id: selectedMaterial,
        title: 'Study Session'
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create session');
      return null;
    }

    return data.id;
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId && selectedMaterial) {
        currentSessionId = await createSession();
        setSessionId(currentSessionId);
      }

      // Call edge function for AI response
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: input,
          materialId: selectedMaterial,
          sessionId: currentSessionId
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save messages to database
      if (currentSessionId) {
        await supabase.from('ai_chat_messages').insert([
          { session_id: currentSessionId, role: 'user', content: input },
          { session_id: currentSessionId, role: 'assistant', content: data.response }
        ]);
      }
    } catch (error) {
      toast.error('Failed to get response');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Please sign in to use AI Study Assistant</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">AI Study Assistant</h1>
        <p className="text-muted-foreground mb-6">Get help with your study materials</p>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Select Study Material (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a material or ask general questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific material</SelectItem>
                {materials.map(material => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.title} - {material.course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ask me anything about your studies!</p>
                  <p className="text-sm mt-2">I can help with explanations, summaries, practice questions, and more.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <Bot className="h-8 w-8 text-primary" />
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-muted-foreground">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={loading}
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
