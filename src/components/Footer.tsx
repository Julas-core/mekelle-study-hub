import { Link } from "react-router-dom";
import { Github, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background" role="contentinfo">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold mb-4"
              aria-label="Mekelle University Logo"
            >
              MU
            </div>
            <h3 className="text-lg font-semibold mb-2">Mekelle University</h3>
            <p className="text-muted-foreground text-sm">
              Empowering education through technology. Providing accessible course materials for all students.
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
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Departments</h3>
            <ul className="space-y-2" aria-label="University departments">
              <li className="text-muted-foreground">Computer Science</li>
              <li className="text-muted-foreground">Engineering</li>
              <li className="text-muted-foreground">Business</li>
              <li className="text-muted-foreground">Medicine</li>
              <li className="text-muted-foreground">Law</li>
              <li className="text-muted-foreground">Education</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>Mekelle, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>+251-XX-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>info@mekelleuniversity.edu.et</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Github className="h-4 w-4" aria-hidden="true" />
                <a 
                  href="https://github.com/mekelle-university" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  aria-label="Mekelle University on GitHub (opens in a new tab)"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mekelle University Course Materials Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};