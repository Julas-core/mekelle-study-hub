import { useEffect, useState } from "react";
import { MaterialCard, Material } from "./MaterialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { getFreshmanMaterials } from "@/utils/courseClassification";

interface FreshmanMaterialsGridProps {
  searchQuery?: string;
}

export const FreshmanMaterialsGrid = ({ searchQuery = "" }: FreshmanMaterialsGridProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter to only include freshman-level courses
      const freshmanMaterials = getFreshmanMaterials(data || []);
      setMaterials(freshmanMaterials);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to load freshman materials');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load freshman materials. Please try again later.',
      });
      console.error('Error loading freshman materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      material.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE) || 1;
  const current = Math.min(currentPage, totalPages);
  const startIdx = (current - 1) * ITEMS_PER_PAGE;
  const paginatedMaterials = filteredMaterials.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (!user) {
    return (
      <section className="py-12 bg-background" aria-label="Sign in required">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
            <Lock className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-2xl font-semibold">Sign in required</h3>
            <p className="text-muted-foreground max-w-md">
              Please sign in to view and access freshman course materials
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-background" aria-label="Loading freshman materials">
        <div className="container px-4">
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground" role="status" aria-live="polite">Loading freshman materials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-background" aria-label="Error loading materials">
        <div className="container px-4">
          <div className="text-center py-16">
            <p className="text-xl text-destructive mb-2">Failed to load materials</p>
            <p className="text-muted-foreground">Error: {error}</p>
            <button 
              onClick={fetchMaterials}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background" aria-label="Freshman course materials">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground" id="freshman-materials-heading">
              Freshman Courses
            </h2>
          </div>
          <p className="text-muted-foreground" id="freshman-materials-count">
            {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'} found
          </p>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16" role="alert" aria-live="assertive">
            <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No freshman materials found</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later or explore all materials</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-labelledby="freshman-materials-heading"
            aria-describedby="freshman-materials-count"
          >
            {paginatedMaterials.map((material) => (
              <div key={material.id} role="listitem">
                <MaterialCard material={material} />
              </div>
            ))}
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  className={current === 1 ? "pointer-events-none opacity-50" : ""} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (current > 1) setCurrentPage(current - 1); 
                  }} 
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    href="#" 
                    isActive={page === current} 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setCurrentPage(page); 
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  className={current === totalPages ? "pointer-events-none opacity-50" : ""} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (current < totalPages) setCurrentPage(current + 1); 
                  }} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  );
};