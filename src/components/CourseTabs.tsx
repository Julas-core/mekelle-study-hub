import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MaterialsGrid } from "@/components/MaterialsGrid";
import { FreshmanMaterialsGrid } from "@/components/FreshmanMaterialsGrid";

interface CourseTabsProps {
  searchQuery: string;
  selectedSchool: string;
}

export const CourseTabs = ({ searchQuery, selectedSchool }: CourseTabsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'freshman'>('all');

  return (
    <div className="w-full">
      <div className="border-b border-border mb-6">
        <div className="container px-4">
          <div className="flex space-x-8">
            <Button
              variant={activeTab === 'all' ? "default" : "ghost"}
              onClick={() => setActiveTab('all')}
              className={`py-4 px-2 text-base border-b-2 ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              role="tab"
              aria-selected={activeTab === 'all'}
              id="all-courses-tab"
            >
              All Courses
            </Button>
            <Button
              variant={activeTab === 'freshman' ? "default" : "ghost"}
              onClick={() => setActiveTab('freshman')}
              className={`py-4 px-2 text-base border-b-2 ${activeTab === 'freshman' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              role="tab"
              aria-selected={activeTab === 'freshman'}
              id="freshman-courses-tab"
            >
              Freshman Courses
            </Button>
          </div>
        </div>
      </div>
      
      <div className="w-full" role="tabpanel" aria-labelledby={activeTab === 'all' ? 'all-courses-tab' : 'freshman-courses-tab'}>
        {activeTab === 'all' ? (
          <MaterialsGrid searchQuery={searchQuery} selectedSchool={selectedSchool} />
        ) : (
          <FreshmanMaterialsGrid searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};