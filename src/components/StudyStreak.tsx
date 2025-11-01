import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Flame } from 'lucide-react';
import { Badge } from './ui/badge';

export const StudyStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const fetchStreak = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc('get_user_streak', {
      p_user_id: user.id
    });

    if (!error && data !== null) {
      setStreak(data);
    }
  };

  if (!user || streak === 0) return null;

  return (
    <Badge variant="outline" className="gap-1.5 px-3 py-1 border-orange-500/30 bg-orange-500/10">
      <Flame className="h-4 w-4 text-orange-500" />
      <span className="font-semibold text-orange-500">{streak} day{streak !== 1 ? 's' : ''}</span>
    </Badge>
  );
};
