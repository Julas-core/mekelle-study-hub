import { useEffect, useState } from "react";
import { MaterialCard, Material } from "./MaterialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaterialsGridProps {
  searchQuery: string;
  selectedDepartment: string;
}

export const MaterialsGrid = ({ searchQuery, selectedDepartment }: MaterialsGridProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load materials',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      material.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === "All Departments" || 
      material.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container px-4">
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">Loading materials...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Available Materials
          </h2>
          <p className="text-muted-foreground">
            {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'} found
          </p>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No materials found matching your criteria</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
