import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MaterialCard, Material } from './MaterialCard';
import { Loader2, Bookmark } from 'lucide-react';

interface BookmarkedMaterialsProps {
  userId: string | undefined;
}

export const BookmarkedMaterials = ({ userId }: BookmarkedMaterialsProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBookmarkedMaterials = async () => {
      // Get all bookmarks for the user
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('material_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (bookmarks && bookmarks.length > 0) {
        // Fetch material details
        const { data: materialsData } = await supabase
          .from('materials')
          .select('*')
          .in('id', bookmarks.map(b => b.material_id));

        if (materialsData) {
          setMaterials(materialsData as Material[]);
        }
      }
      setLoading(false);
    };

    fetchBookmarkedMaterials();

    // Subscribe to bookmark changes
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchBookmarkedMaterials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No bookmarked materials yet</p>
        <p className="text-sm text-muted-foreground">Start bookmarking materials to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Bookmark className="h-6 w-6" />
        Bookmarked Materials
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
};
