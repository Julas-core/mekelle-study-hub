import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MaterialCard, Material } from './MaterialCard';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface RecentlyViewedSectionProps {
  userId: string | undefined;
}

export const RecentlyViewedSection = ({ userId }: RecentlyViewedSectionProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecentlyViewed = async () => {
      // Get last 5 unique recently viewed materials
      const { data: recentViews } = await supabase
        .from('recently_viewed')
        .select('material_id, viewed_at')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (recentViews && recentViews.length > 0) {
        // Get unique material IDs (most recent first)
        const uniqueMaterialIds = [...new Set(recentViews.map(v => v.material_id))].slice(0, 5);

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

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (!userId) return null;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
        <div className="relative">
          <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar" ref={containerRef}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-72">
                <div className="bg-muted rounded-lg h-48 w-full animate-pulse" />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 rounded-full h-8 w-8"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 -left-3 transform -translate-y-1/2 rounded-full h-8 w-8"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (materials.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recently Viewed</h2>
      <div className="relative">
        <div className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar" ref={containerRef}>
          {materials.map((material) => (
            <div key={material.id} className="flex-shrink-0 w-72">
              <MaterialCard material={material} />
            </div>
          ))}
        </div>
        {materials.length > 2 && ( // Only show controls if there are multiple items
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -right-3 transform -translate-y-1/2 rounded-full h-8 w-8"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 -left-3 transform -translate-y-1/2 rounded-full h-8 w-8"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
