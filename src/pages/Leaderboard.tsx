import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  rank: number;
  profile?: {
    full_name: string;
    avatar_url: string;
    department: string;
  };
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'monthly' | 'weekly'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    // Fetch top 10 users
    const { data: topUsers } = await supabase
      .from('user_points')
      .select(`
        user_id,
        total_points,
        profiles:user_id (
          full_name,
          avatar_url,
          department
        )
      `)
      .order('total_points', { ascending: false })
      .limit(10);

    if (topUsers) {
      const formatted = topUsers.map((entry: any, index) => ({
        user_id: entry.user_id,
        total_points: entry.total_points,
        rank: index + 1,
        profile: entry.profiles
      }));
      setLeaderboard(formatted);
    }

    // Fetch current user's rank
    if (user) {
      const { data: allUsers } = await supabase
        .from('user_points')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });

      if (allUsers) {
        const userIndex = allUsers.findIndex((u: any) => u.user_id === user.id);
        if (userIndex !== -1) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, department')
            .eq('id', user.id)
            .single();

          setUserRank({
            user_id: user.id,
            total_points: allUsers[userIndex].total_points,
            rank: userIndex + 1,
            profile: userProfile
          });
        }
      }
    }

    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground mb-6">Top performers in the MU StudyHub community</p>

        <Tabs defaultValue="all" className="mb-6" onValueChange={(v) => setTimeframe(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {userRank && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(userRank.rank)}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userRank.profile?.avatar_url} />
                  <AvatarFallback>{userRank.profile?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{userRank.profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{userRank.profile?.department}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {userRank.total_points.toLocaleString()} pts
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      entry.rank <= 3 ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entry.profile?.avatar_url} />
                      <AvatarFallback>{entry.profile?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{entry.profile?.department}</p>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {entry.total_points.toLocaleString()} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
