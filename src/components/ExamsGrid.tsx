import { useEffect, useState } from "react";
import { MaterialCard, Material } from "./MaterialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MEKELLE_UNIVERSITY_SCHOOLS } from "@/constants/colleges";

interface ExamsGridProps {
  searchQuery: string;
  selectedSchool: string;
  selectedDepartment?: string;
}

export const ExamsGrid = ({ searchQuery, selectedSchool, selectedDepartment = "all" }: ExamsGridProps) => {
  const [exams, setExams] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSchool, selectedDepartment]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('material_type', 'exam')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to load exams');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load exams. Please try again later.',
      });
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.exam_year?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (selectedSchool === "All Schools") {
      if (selectedDepartment && selectedDepartment !== "all") {
        return matchesSearch && exam.department === selectedDepartment;
      }
      return matchesSearch;
    }
    
    if (selectedSchool === "Freshman Courses") {
      return matchesSearch;
    }

    const departmentsInSchool: readonly string[] = MEKELLE_UNIVERSITY_SCHOOLS[selectedSchool as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS] || [];
    const matchesSchool = departmentsInSchool.includes(exam.department);

    if (selectedDepartment && selectedDepartment !== "all") {
      const matchesDepartment = exam.department === selectedDepartment;
      return matchesSearch && matchesSchool && matchesDepartment;
    }

    return matchesSearch && matchesSchool;
  });

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE) || 1;
  const current = Math.min(currentPage, totalPages);
  const startIdx = (current - 1) * ITEMS_PER_PAGE;
  const paginatedExams = filteredExams.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (!user) {
    return (
      <section className="py-12 bg-background" aria-label="Sign in required">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
            <Lock className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-2xl font-semibold">Sign in required</h3>
            <p className="text-muted-foreground max-w-md">
              Please sign in to view and access past exams
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
      <section className="py-12 bg-background" aria-label="Loading exams">
        <div className="container px-4">
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground" role="status" aria-live="polite">Loading exams...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-background" aria-label="Error loading exams">
        <div className="container px-4">
          <div className="text-center py-16">
            <p className="text-xl text-destructive mb-2">Failed to load exams</p>
            <p className="text-muted-foreground">Error: {error}</p>
            <button 
              onClick={fetchExams}
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
    <section className="py-12 bg-background" aria-label="Available past exams">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground" id="exams-heading">
              Past Exams
            </h2>
          </div>
          <p className="text-muted-foreground" id="exams-count">
            {filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'} found
          </p>
        </div>

        {filteredExams.length === 0 ? (
          <div className="text-center py-16" role="alert" aria-live="assertive">
            <p className="text-xl text-muted-foreground">No exams found matching your criteria</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-labelledby="exams-heading"
            aria-describedby="exams-count"
          >
            {paginatedExams.map((exam) => (
              <div key={exam.id} role="listitem">
                <MaterialCard material={exam} />
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
