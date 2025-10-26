import { Button } from "@/components/ui/button";
import { MEKELLE_UNIVERSITY_SCHOOLS } from "@/constants/colleges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const filterOptions = [
  "All Schools",
  "Freshman Courses", // Add Freshman Courses as a filter option
  ...Object.keys(MEKELLE_UNIVERSITY_SCHOOLS)
];

interface DepartmentFilterProps {
  selectedSchool: string;
  selectedDepartment: string;
  onSchoolSelect: (school: string) => void;
  onDepartmentSelect: (department: string) => void;
}

export const DepartmentFilter = ({ 
  selectedSchool, 
  selectedDepartment, 
  onSchoolSelect, 
  onDepartmentSelect 
}: DepartmentFilterProps) => {
  const handleKeyDown = (e: React.KeyboardEvent, school: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSchoolSelect(school);
    }
  };

  // Get available departments based on selected school
  const departments = selectedSchool !== "All Schools" && selectedSchool !== "Freshman Courses"
    ? MEKELLE_UNIVERSITY_SCHOOLS[selectedSchool as keyof typeof MEKELLE_UNIVERSITY_SCHOOLS] || []
    : [];

  return (
    <section 
      id="school-filter" className="py-12 border-b bg-card" 
      aria-label="School and department filter"
    >
      <div className="container px-4">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Browse Materials</h2>
        
        {/* School Filter */}
        <div 
          className="flex flex-wrap gap-2 mb-6"
          role="group"
          aria-label="School selection"
        >
          {filterOptions.map((school) => (
            <Button
              key={school}
              variant={selectedSchool === school ? "default" : "outline"}
              onClick={() => {
                onSchoolSelect(school);
                // When school changes, reset department selection
                onDepartmentSelect("all");
              }}
              onKeyDown={(e) => handleKeyDown(e, school)}
              size="lg" 
              className="transition-all rounded-full px-4"
              aria-pressed={selectedSchool === school}
              role="tab"
              tabIndex={0}
            >
              {school}
            </Button>
          ))}
        </div>
        
        {/* Department Filter - Only shown when a specific school is selected */}
        {selectedSchool !== "All Schools" && selectedSchool !== "Freshman Courses" && departments.length > 0 && (
          <div className="mb-4">
            <label htmlFor="department-select" className="block text-lg font-medium mb-2 text-foreground">
              Filter by Department
            </label>
            <Select 
              value={selectedDepartment} 
              onValueChange={onDepartmentSelect}
            >
              <SelectTrigger id="department-select" className="w-full max-w-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </section>
  );
};
