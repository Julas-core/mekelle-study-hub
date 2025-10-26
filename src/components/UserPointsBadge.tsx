import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';

interface UserPointsBadgeProps {
  userId: string | undefined;
  variant?: 'default' | 'large';
}

export const UserPointsBadge = ({ userId, variant = 'default' }: UserPointsBadgeProps) => {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchPoints = async () => {
      const { data } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .maybeSingle();

      setPoints(data?.total_points || 0);
    };

    fetchPoints();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('user-points-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.new) {
            setPoints(payload.new.total_points);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (variant === 'large') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <div className="text-sm text-muted-foreground">Your Points</div>
          <div className="text-2xl font-bold text-primary">{points.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 px-3 py-1 border-primary/20">
      <Trophy className="h-3.5 w-3.5 text-primary" />
      <span className="font-semibold">{points}</span>
    </Badge>
  );
};
