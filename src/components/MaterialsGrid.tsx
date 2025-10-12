import { MaterialCard, Material } from "./MaterialCard";

interface MaterialsGridProps {
  materials: Material[];
  searchQuery: string;
  selectedDepartment: string;
}

export const MaterialsGrid = ({ materials, searchQuery, selectedDepartment }: MaterialsGridProps) => {
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === "All Departments" || 
      material.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

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
