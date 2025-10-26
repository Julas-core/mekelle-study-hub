import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MaterialCard, Material } from './MaterialCard';
import { Loader2 } from 'lucide-react';

interface RecentlyViewedSectionProps {
  userId: string | undefined;
}

export const RecentlyViewedSection = ({ userId }: RecentlyViewedSectionProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecentlyViewed = async () => {
      // Get last 2 unique recently viewed materials
      const { data: recentViews } = await supabase
        .from('recently_viewed')
        .select('material_id, viewed_at')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (recentViews && recentViews.length > 0) {
        // Get unique material IDs (most recent first)
        const uniqueMaterialIds = [...new Set(recentViews.map(v => v.material_id))].slice(0, 2);

        // Fetch material details
        const { data: materialsData } = await supabase
          .from('materials')
          .select('*')
          .in('id', uniqueMaterialIds);

        if (materialsData) {
          // Sort materials by the order they appear in uniqueMaterialIds
          const sortedMaterials = uniqueMaterialIds
            .map(id => materialsData.find(m => m.id === id))
            .filter(m => m !== undefined) as Material[];
          
          setMaterials(sortedMaterials);
        }
      }
      setLoading(false);
    };

    fetchRecentlyViewed();
  }, [userId]);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (materials.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recently Viewed</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
};
