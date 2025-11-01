import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { MaterialsGrid } from "@/components/MaterialsGrid";
import { ExamsGrid } from "@/components/ExamsGrid";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { TrendingMaterials } from "@/components/TrendingMaterials";
import { MaterialRequestForm } from "@/components/MaterialRequestForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      <section className="py-12 border-b bg-card">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="materials">Study Materials</TabsTrigger>
              <TabsTrigger value="exams">Past Exams</TabsTrigger>
            </TabsList>
            
            <DepartmentFilter 
              selectedSchool={selectedSchool}
              selectedDepartment={selectedDepartment}
              onSchoolSelect={setSelectedSchool}
              onDepartmentSelect={setSelectedDepartment}
            />

            <TabsContent value="materials">
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
            </TabsContent>

            <TabsContent value="exams">
              <ExamsGrid 
                searchQuery={searchQuery}
                selectedSchool={selectedSchool}
                selectedDepartment={selectedDepartment}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;
