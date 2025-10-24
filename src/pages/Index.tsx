import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { MaterialsGrid } from "@/components/MaterialsGrid";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Colleges");

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={setSearchQuery} />
      <DepartmentFilter 
        selected={selectedDepartment} 
        onSelect={setSelectedDepartment} 
      />
      <MaterialsGrid 
        searchQuery={searchQuery}
        selectedCollege={selectedDepartment}
      />
    </div>
  );
};

export default Index;
