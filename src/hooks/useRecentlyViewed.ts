import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRecentlyViewed = (materialId: string, userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const trackView = async () => {
      await supabase
        .from('recently_viewed')
        .insert({
          user_id: userId,
          material_id: materialId,
        });
    };

    trackView();
  }, [materialId, userId]);
};
