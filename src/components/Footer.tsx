import { Link } from "react-router-dom";
import { Github, Mail, Phone, MapPin } from "lucide-react";
// Use Vite-compatible URL import for static asset (SVG) to avoid runtime import issues
const StudyHubLogo = new URL('../assets/Banner.png', import.meta.url).href;

export const Footer = () => {
  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="container py-12 md:py-16">
  <div className="grid grid-cols-1 gap-8 md:flex md:justify-between md:items-start">
          <div>
            <img 
              src={StudyHubLogo} 
              alt="MUHub Logo" 
              className="h-10 object-contain mb-4" 
              aria-label="MUHub Logo" 
            />
            <p className="text-muted-foreground text-sm">
              Empowering education through technology.
            </p>
            <p className="text-muted-foreground text-sm">
              Providing accessible course materials for all students.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>
          
          {/* Departments section removed per request */}
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>Mekelle, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>+251-93-639-3952</span>
              </li>
              {/* <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>julasmame@gmail.com</span>
              </li> */}
              <li className="flex items-center gap-2 text-muted-foreground">
                <Github className="h-4 w-4" aria-hidden="true" />
                <a 
                  href="https://github.com/Julas-core?tab=repositories" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  aria-label="Mekelle University on GitHub (opens in a new tab)"
                >
                  If you liked to contribute, you can here.
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MUStudy-Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
