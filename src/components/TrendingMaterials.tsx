import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialCard } from './MaterialCard';
import { Skeleton } from '@/components/ui/skeleton';

export const TrendingMaterials = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      // Get materials with highest download count in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data } = await supabase
        .from('materials')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('download_count', { ascending: false })
        .limit(6);

      if (data) {
        setMaterials(data);
      }
      setLoading(false);
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔥 Trending This Week</CardTitle>
          <CardDescription>Most downloaded materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (materials.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔥 Trending This Week</CardTitle>
        <CardDescription>Most downloaded materials in the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
