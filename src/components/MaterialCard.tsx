import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, User, Bookmark, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackDownload } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useRatings } from "@/hooks/useRatings";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  department: string;
  course: string;
  file_type: string;
  file_path: string;
  file_size: string;
  uploaded_by: string;
  uploaded_by_user_id?: string | null;
  created_at: string;
  download_count?: number;
  material_type?: string;
  exam_year?: string | null;
  exam_semester?: string | null;
}

interface MaterialCardProps {
  material: Material;
}

const typeColors = {
  PDF: "bg-destructive/10 text-destructive border-destructive/20",
  PPT: "bg-accent/10 text-accent-foreground border-accent/20",
  DOC: "bg-primary/10 text-primary border-primary/20",
  VIDEO: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  OTHER: "bg-muted/10 text-muted-foreground border-muted/20",
};

export const MaterialCard = ({ material }: MaterialCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploaderLabel, setUploaderLabel] = useState<string>(material.uploaded_by || 'Unknown');
  
  // Phase 1 features
  const { bookmarks, toggleBookmark } = useBookmarks(user?.id);
  const { stats, userRating, submitRating } = useRatings(material.id, user?.id);
  useRecentlyViewed(material.id, user?.id);
  
  const isBookmarked = bookmarks.has(material.id);

  // Simple in-memory cache for resolved uploader labels to avoid repeated DB calls
  const uploaderCache = (MaterialCard as any)._uploaderCache || new Map<string, string>();
  (MaterialCard as any)._uploaderCache = uploaderCache;

  useEffect(() => {
    let mounted = true;
    const resolveLabel = async () => {
      const userId = (material as any).uploaded_by_user_id;
      if (!userId) {
        setUploaderLabel(material.uploaded_by || 'Unknown');
        return;
      }

        if (uploaderCache.has(userId)) {
          if (!mounted) return;
          setUploaderLabel(uploaderCache.get(userId) as string);
          return;
        }

      try {
        // Check role first
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (!roleError && roleData && roleData.role === 'admin') {
          uploaderCache.set(userId, 'Admin');
          if (mounted) setUploaderLabel('Admin');
          return;
        }

        // Not admin - fetch profile name/email
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .maybeSingle();

        const label = profileData?.full_name || profileData?.email || material.uploaded_by || 'Unknown';
        uploaderCache.set(userId, label);
        if (mounted) setUploaderLabel(label);
      } catch (e) {
        // fallback
        uploaderCache.set(userId, material.uploaded_by || 'Unknown');
        if (mounted) setUploaderLabel(material.uploaded_by || 'Unknown');
      }
    };

    resolveLabel();
    return () => { mounted = false; };
  }, [material]);

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('course-materials')
        .download(material.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.file_path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Increment download count
      await supabase.rpc('increment_download_count', {
        p_material_id: material.id
      });

      // Award points to downloader (2 points)
      if (user?.id) {
        await supabase.rpc('award_points', {
          p_user_id: user.id,
          p_points: 2,
          p_action_type: 'download',
          p_reference_id: material.id,
        });
      }

      // Award points to uploader (10 points)
      if (material.uploaded_by_user_id) {
        await supabase.rpc('award_points', {
          p_user_id: material.uploaded_by_user_id,
          p_points: 10,
          p_action_type: 'material_downloaded',
          p_reference_id: material.id,
        });
      }

      toast({
        title: 'Download started',
        description: user?.id ? 'Your file is downloading... +2 points' : 'Your file is downloading...',
      });
      
      trackDownload(material.title, material.file_type);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: error.message || 'Failed to download file',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDownload();
    }
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="article"
      aria-labelledby={`material-title-${material.id}`}
      aria-describedby={`material-description-${material.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge 
              className={typeColors[material.file_type as keyof typeof typeColors] || typeColors.OTHER}
              aria-label={`File type: ${material.file_type}`}
            >
              {material.file_type}
            </Badge>
            <span className="text-xs text-muted-foreground" id={`material-size-${material.id}`}>
              {material.file_size}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(material.id);
            }}
            className={cn("h-8 w-8 p-0", isBookmarked && "text-primary")}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          </Button>
        </div>
        <CardTitle 
          className="text-xl group-hover:text-primary transition-colors" 
          id={`material-title-${material.id}`}
        >
          {material.title}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="border-primary/20 text-primary">
            {material.course}
          </Badge>
          <Badge variant="secondary">
            {material.department}
          </Badge>
        </div>
        <CardDescription 
          className="line-clamp-2" 
          id={`material-description-${material.id}`}
        >
          {material.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm" aria-label="Material details">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">
                  {material.download_count || 0} downloads
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StarRating rating={stats.averageRating} size={16} />
              <span className="text-xs text-muted-foreground">
                {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} (${stats.totalRatings})` : 'No ratings yet'}
              </span>
            </div>
            {user && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Rate:</span>
                <StarRating
                  rating={userRating || 0}
                  size={18}
                  interactive
                  onRatingChange={submitRating}
                  userRating={userRating}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground" aria-label="Uploaded by">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>{uploaderLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs" aria-label="Upload date">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{formatDate(material.created_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDownload} 
          className="w-full gap-2 bg-primary hover:bg-primary/90" 
          aria-label={`Download ${material.title}`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download Material
        </Button>
      </CardFooter>
    </Card>
  );
};
