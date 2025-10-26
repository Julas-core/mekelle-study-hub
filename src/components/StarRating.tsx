import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  userRating?: number | null;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 16,
  interactive = false,
  onRatingChange,
  userRating
}: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => {
        const filled = value <= displayRating;
        const isUserRated = userRating !== null && value <= userRating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoveredRating(value)}
            onMouseLeave={() => interactive && setHoveredRating(null)}
            disabled={!interactive}
            className={cn(
              "transition-all",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
            aria-label={`Rate ${value} stars`}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                isUserRated && "fill-primary text-primary"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
