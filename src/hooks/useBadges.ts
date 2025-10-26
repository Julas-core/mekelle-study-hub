import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned_at?: string;
}

export const useBadges = (userId: string | undefined) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      const { data } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges:badge_id (
            id,
            name,
            description,
            icon,
            requirement_type,
            requirement_value
          )
        `)
        .eq('user_id', userId);

      if (data) {
        const formattedBadges = data.map((item: any) => ({
          ...item.badges,
          earned_at: item.earned_at,
        }));
        setBadges(formattedBadges);
      }
      setLoading(false);
    };

    fetchBadges();

    // Subscribe to badge updates
    const channel = supabase
      .channel(`badges:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBadges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { badges, loading };
};
