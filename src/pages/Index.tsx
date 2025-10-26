import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { MaterialsGrid } from "@/components/MaterialsGrid";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { TrendingMaterials } from "@/components/TrendingMaterials";
import { MaterialRequestForm } from "@/components/MaterialRequestForm";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("All Schools");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <MaterialRequestForm />
      </div>

      <DepartmentFilter 
        selectedSchool={selectedSchool}
        selectedDepartment={selectedDepartment}
        onSchoolSelect={setSelectedSchool}
        onDepartmentSelect={setSelectedDepartment}
      />
      
      {/* Trending Materials Section */}
      <div className="container mx-auto px-4 py-8">
        <TrendingMaterials />
      </div>

      {/* Recently Viewed Section - Only show when user is logged in */}
      {user && (
        <div className="container mx-auto px-4 py-8">
          <RecentlyViewedSection userId={user.id} />
        </div>
      )}
      
      <MaterialsGrid 
        searchQuery={searchQuery}
        selectedSchool={selectedSchool}
        selectedDepartment={selectedDepartment}
      />
    </div>
  );
};

export default Index;
