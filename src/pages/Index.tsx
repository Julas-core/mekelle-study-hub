import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { CourseTabs } from "@/components/CourseTabs";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("All Schools");

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={setSearchQuery} />
      <DepartmentFilter 
        selected={selectedSchool} 
        onSelect={setSelectedSchool} 
      />
      <CourseTabs 
        searchQuery={searchQuery}
        selectedSchool={selectedSchool}
      />
    </div>
  );
};

export default Index;
