import { Button } from "@/components/ui/button";
import { MEKELLE_UNIVERSITY_SCHOOLS } from "@/constants/colleges";

const schools = [
  "All Schools",
  ...Object.keys(MEKELLE_UNIVERSITY_SCHOOLS)
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
      id="school-filter" className="py-12 border-b bg-card" 
      aria-label="School filter"
    >
      <div className="container px-4">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Browse by School</h2>
        <div 
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="School selection"
        >
          {schools.map((department) => (
            <Button
              key={department}
              variant={selected === department ? "default" : "outline"}
              onClick={() => onSelect(department)}
              onKeyDown={(e) => handleKeyDown(e, department)}
              size="lg" className="transition-all rounded-full px-4"
              aria-pressed={selected === department}
              role="tab"
              tabIndex={0}
            >
              {department}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
