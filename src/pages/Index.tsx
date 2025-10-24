import { useState } from "react";
import { Hero } from "@/components/Hero";
import { CollegeFilter } from "@/components/CollegeFilter";
import { MaterialsGrid } from "@/components/MaterialsGrid";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={setSearchQuery} />
      <CollegeFilter 
        selected={selectedCollege} 
        onSelect={setSelectedCollege} 
      />
      <MaterialsGrid 
        searchQuery={searchQuery}
        selectedCollege={selectedCollege}
      />
    </div>
  );
};

export default Index;
