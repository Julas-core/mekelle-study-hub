import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPointsBadge } from '@/components/UserPointsBadge';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { BookmarkedMaterials } from '@/components/BookmarkedMaterials';
import { RecentlyViewedSection } from '@/components/RecentlyViewedSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Star, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    uploads: 0,
    downloads: 0,
    ratings: 0,
    comments: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const [uploads, downloads, ratings, comments] = await Promise.all([
        supabase.from('materials').select('*', { count: 'exact', head: true }).eq('uploaded_by_user_id', user.id),
        supabase.from('point_transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'download'),
        supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setStats({
        uploads: uploads.count || 0,
        downloads: downloads.count || 0,
        ratings: ratings.count || 0,
        comments: comments.count || 0,
      });
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Please sign in to view your dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <UserPointsBadge userId={user.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Materials Uploaded</CardTitle>
            <Upload className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uploads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Materials Downloaded</CardTitle>
            <Download className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ratings Given</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ratings}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarked Materials</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
        </TabsList>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>
                Achievements unlocked through your activity on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeDisplay userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks">
          <BookmarkedMaterials userId={user.id} />
        </TabsContent>

        <TabsContent value="recent">
          <RecentlyViewedSection userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
