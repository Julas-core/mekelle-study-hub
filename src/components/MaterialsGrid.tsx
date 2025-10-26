import { useEffect, useState } from "react";
import { MaterialCard, Material } from "./MaterialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MEKELLE_UNIVERSITY_SCHOOLS } from "@/constants/colleges";
import { getFreshmanMaterials } from "@/utils/courseClassification";

interface MaterialsGridProps {
  searchQuery: string;
  selectedSchool: string;
  selectedDepartment?: string;
}

export const MaterialsGrid = ({ searchQuery, selectedSchool, selectedDepartment = "" }: MaterialsGridProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('MaterialsGrid: user state changed', { user: !!user, userId: user?.id });
    if (user) {
      fetchMaterials();
    }
  }, [user]);

  // Reset to first page when search, school, or department filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSchool, selectedDepartment]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
      setError(null); // Clear any previous error
    } catch (error: any) {
      setError(error.message || 'Failed to load materials');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load materials. Please try again later.',
      });
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      material.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If "All Schools" is selected, show all materials
    if (selectedSchool === "All Schools") {
      // If a specific department is selected, filter by that department
      if (selectedDepartment) {
        return matchesSearch && material.department === selectedDepartment;
      }
      return matchesSearch;
    }
    
    // If "Freshman Courses" is selected, show only freshman materials
    if (selectedSchool === "Freshman Courses") {
      const isFreshman = getFreshmanMaterials([material]).length > 0;
      return matchesSearch && isFreshman;
    }

    // Check if the material's department belongs to the selected school
    const departmentsInSchool: readonly string[] = MEKELLE_UNIVERSITY_SCHOOLS[selectedSchool as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS] || [];
    const matchesSchool = departmentsInSchool.includes(material.department);

    // If both school and department are selected, apply both filters
    if (selectedDepartment) {
      const matchesDepartment = material.department === selectedDepartment;
      return matchesSearch && matchesSchool && matchesDepartment;
    }

    return matchesSearch && matchesSchool;
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
              Please sign in to view and access course materials
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
      <section className="py-12 bg-background" aria-label="Loading materials">
        <div className="container px-4">
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground" role="status" aria-live="polite">Loading materials...</p>
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
    <section className="py-12 bg-background" aria-label="Available course materials">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {selectedSchool === "Freshman Courses" ? (
              <GraduationCap className="h-8 w-8 text-primary" />
            ) : null}
            <h2 className="text-3xl font-bold text-foreground" id="materials-heading">
              {selectedSchool === "Freshman Courses" ? "Freshman Courses" : "Available Materials"}
            </h2>
          </div>
          <p className="text-muted-foreground" id="materials-count">
            {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'} found
          </p>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16" role="alert" aria-live="assertive">
            <p className="text-xl text-muted-foreground">No materials found matching your criteria</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-labelledby="materials-heading"
            aria-describedby="materials-count"
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
                <PaginationPrevious href="#" className={current === 1 ? "pointer-events-none opacity-50" : ""} onClick={(e) => { e.preventDefault(); if (current > 1) setCurrentPage(current - 1); }} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink href="#" isActive={page === current} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" className={current === totalPages ? "pointer-events-none opacity-50" : ""} onClick={(e) => { e.preventDefault(); if (current < totalPages) setCurrentPage(current + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  );
};
