import { Button } from "@/components/ui/button";
import { MEKELLE_UNIVERSITY_COLLEGES } from "@/constants/colleges";

const colleges = [
  "All Colleges",
  ...MEKELLE_UNIVERSITY_COLLEGES
];

interface CollegeFilterProps {
  selected: string;
  onSelect: (college: string) => void;
}

export const CollegeFilter = ({ selected, onSelect }: CollegeFilterProps) => {
  const handleKeyDown = (e: React.KeyboardEvent, college: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(college);
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
          {colleges.map((college) => (
            <Button
              key={college}
              variant={selected === college ? "default" : "outline"}
              onClick={() => onSelect(college)}
              onKeyDown={(e) => handleKeyDown(e, college)}
              className="transition-all"
              aria-pressed={selected === college}
              role="tab"
              tabIndex={0}
            >
              {college}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
