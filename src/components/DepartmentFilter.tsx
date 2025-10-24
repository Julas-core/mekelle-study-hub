import { Button } from "@/components/ui/button";
import { MEKELLE_UNIVERSITY_COLLEGES } from "@/constants/colleges";

const colleges = [
  "All Colleges",
  ...MEKELLE_UNIVERSITY_COLLEGES
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
      aria-label="College filter"
    >
      <div className="container px-4">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Browse by College</h2>
        <div 
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="College selection"
        >
          {colleges.map((department) => (
            <Button
              key={department}
              variant={selected === department ? "default" : "outline"}
              onClick={() => onSelect(department)}
              onKeyDown={(e) => handleKeyDown(e, department)}
              className="transition-all"
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
