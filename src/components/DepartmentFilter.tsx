import { Button } from "@/components/ui/button";

const departments = [
  "All Departments",
  "Computer Science",
  "Engineering",
  "Business & Economics",
  "Natural Sciences",
  "Social Sciences",
  "Medicine & Health",
  "Law",
  "Arts & Humanities"
];

interface DepartmentFilterProps {
  selected: string;
  onSelect: (department: string) => void;
}

export const DepartmentFilter = ({ selected, onSelect }: DepartmentFilterProps) => {
  const handleKeyDown = (e: React.KeyboardEvent, department: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(department);
    }
  };

  return (
    <section 
      className="py-8 border-b bg-card" 
      aria-label="Department filter"
    >
      <div className="container px-4">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Browse by Department</h2>
        <div 
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Department selection"
        >
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selected === dept ? "default" : "outline"}
              onClick={() => onSelect(dept)}
              onKeyDown={(e) => handleKeyDown(e, dept)}
              className="transition-all"
              aria-pressed={selected === dept}
              role="tab"
              tabIndex={0}
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
