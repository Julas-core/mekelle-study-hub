import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RatingStats {
  averageRating: number;
  totalRatings: number;
}

export const useRatings = (materialId: string, userId: string | undefined) => {
  const [stats, setStats] = useState<RatingStats>({ averageRating: 0, totalRatings: 0 });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRatings = async () => {
    // Get all ratings for average
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('material_id', materialId);

    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      setStats({ averageRating: avg, totalRatings: allRatings.length });
    }

    // Get user's rating if logged in
    if (userId) {
      const { data: userRatingData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('material_id', materialId)
        .eq('user_id', userId)
        .maybeSingle();

      setUserRating(userRatingData?.rating || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRatings();
  }, [materialId, userId]);

  const submitRating = async (rating: number) => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Sign in required',
        description: 'Please sign in to rate materials',
      });
      return;
    }

    const { error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        material_id: materialId,
        rating,
      });

    if (!error) {
      setUserRating(rating);
      await fetchRatings();
      
      // Award points for rating (5 points)
      await supabase.rpc('award_points', {
        p_user_id: userId,
        p_points: 5,
        p_action_type: 'rating',
        p_reference_id: materialId,
      });

      toast({
        title: 'Rating submitted',
        description: 'Thanks for your feedback! +5 points',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Rating failed',
        description: 'Failed to submit rating',
      });
    }
  };

  return { stats, userRating, loading, submitRating };
};
