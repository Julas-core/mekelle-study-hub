import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { MaterialsGrid } from "@/components/MaterialsGrid";
import { sampleMaterials } from "@/data/sampleMaterials";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={setSearchQuery} />
      <DepartmentFilter 
        selected={selectedDepartment} 
        onSelect={setSelectedDepartment} 
      />
      <MaterialsGrid 
        materials={sampleMaterials}
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
      />
    </div>
  );
};

export default Index;
