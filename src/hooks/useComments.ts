import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  material_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export const useComments = (materialId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles separately
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const commentsWithProfiles = data.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id) || null,
      }));

      setComments(commentsWithProfiles as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`comments:${materialId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `material_id=eq.${materialId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [materialId]);

  const addComment = async (content: string, parentId: string | null = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'Please sign in to comment',
      });
      return;
    }

    const { error } = await supabase.from('comments').insert({
      material_id: materialId,
      user_id: user.id,
      content,
      parent_id: parentId,
    });

    if (!error) {
      // Award points for commenting (5 points)
      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: 5,
        p_action_type: 'comment',
        p_reference_id: materialId,
      });

      // Check for badges
      await supabase.rpc('check_and_award_badges', { p_user_id: user.id });

      toast({
        title: 'Comment posted',
        description: '+5 points',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to post comment',
      });
    }
  };

  return { comments, loading, addComment };
};
