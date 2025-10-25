import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/university-gateway.jpg";
import { trackSearch } from "@/hooks/useAnalytics";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch(query);
    trackSearch(query); // Track search event
  };

  return (
    <section 
      className="relative h-[500px] flex items-center justify-center overflow-hidden" 
      aria-label="University welcome and search"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/75" />
      </div>
      
      <div className="relative z-10 container px-4 text-center">
        <div className="mb-6" role="banner">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
            Mekelle University
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-2">
            Course Materials Hub
          </p>
          <p className="text-lg text-primary-foreground/80">
            Access and share educational resources
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto" role="search">
          <div className="flex gap-2 bg-card p-3 rounded-xl shadow-lg">
            <div className="relative flex-1">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" 
                aria-hidden="true"
              />
              <Input
                type="text"
                name="search"
                placeholder="Search courses, materials, or topics..."
                className="pl-10 border-0 bg-transparent focus-visible:ring-0 w-full h-14 text-base"
                aria-label="Search for course materials"
              />
            </div>
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8">
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="h-14 px-5" 
              onClick={() => document.getElementById('school-filter')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Advanced Filters
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
