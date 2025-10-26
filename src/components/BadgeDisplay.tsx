import { useBadges } from '@/hooks/useBadges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BadgeDisplayProps {
  userId: string | undefined;
  compact?: boolean;
}

export const BadgeDisplay = ({ userId, compact = false }: BadgeDisplayProps) => {
  const { badges, loading } = useBadges(userId);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No badges earned yet. Keep participating to earn your first badge!
      </p>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 5).map((badge) => (
          <Badge key={badge.id} variant="secondary" className="text-lg">
            {badge.icon}
          </Badge>
        ))}
        {badges.length > 5 && (
          <Badge variant="outline">+{badges.length - 5} more</Badge>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <Card key={badge.id} className="text-center">
          <CardHeader className="pb-2">
            <div className="text-4xl mb-2">{badge.icon}</div>
            <CardTitle className="text-sm">{badge.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              {badge.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
