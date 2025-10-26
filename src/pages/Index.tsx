import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { MaterialsGrid } from "@/components/MaterialsGrid";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("All Schools");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={setSearchQuery} />
      <DepartmentFilter 
        selectedSchool={selectedSchool}
        selectedDepartment={selectedDepartment}
        onSchoolSelect={setSelectedSchool}
        onDepartmentSelect={setSelectedDepartment}
      />
      <MaterialsGrid 
        searchQuery={searchQuery}
        selectedSchool={selectedSchool}
        selectedDepartment={selectedDepartment}
      />
    </div>
  );
};

export default Index;
