import { FileText, Download, Calendar, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Material {
  id: string;
  title: string;
  description: string;
  department: string;
  course: string;
  type: "PDF" | "PPT" | "DOC" | "VIDEO";
  uploadDate: string;
  uploadedBy: string;
  size: string;
}

interface MaterialCardProps {
  material: Material;
}

const typeColors = {
  PDF: "bg-destructive/10 text-destructive border-destructive/20",
  PPT: "bg-accent/10 text-accent-foreground border-accent/20",
  DOC: "bg-primary/10 text-primary border-primary/20",
  VIDEO: "bg-secondary/10 text-secondary-foreground border-secondary/20",
};

export const MaterialCard = ({ material }: MaterialCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={typeColors[material.type]}>
            {material.type}
          </Badge>
          <span className="text-xs text-muted-foreground">{material.size}</span>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {material.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{material.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{material.course}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{material.uploadedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{material.uploadDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4" />
          Download Material
        </Button>
      </CardFooter>
    </Card>
  );
};
