import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch(query);
  };

  return (
    <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/75" />
      </div>
      
      <div className="relative z-10 container px-4 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-secondary rounded" />
            <div className="h-1 w-12 bg-accent rounded" />
            <div className="h-1 w-12 bg-destructive rounded" />
          </div>
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

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-2 bg-card p-2 rounded-lg shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                name="search"
                placeholder="Search courses, materials, or topics..."
                className="pl-10 border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <Button type="submit" size="lg" className="bg-secondary hover:bg-secondary/90">
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
