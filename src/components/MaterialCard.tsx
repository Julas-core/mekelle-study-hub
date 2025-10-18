import { FileText, Download, Calendar, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackDownload } from "@/hooks/useAnalytics";

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
  created_at: string;
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

      toast({
        title: 'Download started',
        description: 'Your file is downloading...',
      });
      
      trackDownload(material.title, material.file_type); // Track download event
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
        <CardTitle 
          className="text-xl group-hover:text-primary transition-colors" 
          id={`material-title-${material.id}`}
        >
          {material.title}
        </CardTitle>
        <CardDescription 
          className="line-clamp-2" 
          id={`material-description-${material.id}`}
        >
          {material.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm" aria-label="Material details">
          <div className="flex items-center gap-2 text-muted-foreground" aria-label="Course">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>{material.course}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground" aria-label="Uploaded by">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>{material.uploaded_by}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground" aria-label="Upload date">
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
