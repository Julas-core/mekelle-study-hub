import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBookmarks = (userId: string | undefined) => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setBookmarks(new Set());
      setLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('material_id')
        .eq('user_id', userId);

      if (!error && data) {
        setBookmarks(new Set(data.map(b => b.material_id)));
      }
      setLoading(false);
    };

    fetchBookmarks();
  }, [userId]);

  const toggleBookmark = async (materialId: string) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'Please sign in to bookmark materials',
      });
      return;
    }

    const isBookmarked = bookmarks.has(materialId);

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('material_id', materialId);

      if (!error) {
        setBookmarks(prev => {
          const next = new Set(prev);
          next.delete(materialId);
          return next;
        });
        toast({
          title: 'Bookmark removed',
        });
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, material_id: materialId });

      if (!error) {
        setBookmarks(prev => new Set([...prev, materialId]));
        toast({
          title: 'Bookmarked',
          description: 'Material saved to your bookmarks',
        });
      }
    }
  };

  return { bookmarks, loading, toggleBookmark };
};
