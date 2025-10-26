import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tag {
  id: string;
  name: string;
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (data) {
        setTags(data);
      }
      setLoading(false);
    };

    fetchTags();
  }, []);

  const createTag = async (name: string) => {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name })
      .select()
      .single();

    if (!error && data) {
      setTags(prev => [...prev, data]);
      return data;
    }
    return null;
  };

  return { tags, loading, createTag };
};
