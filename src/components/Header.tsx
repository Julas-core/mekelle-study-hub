import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Upload, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// Use Vite-compatible URL import for static asset (SVG) to avoid runtime import issues
const StudyHubLogo = new URL('../assets/StudyHubLogo.png', import.meta.url).href;

export type HeaderProps = {
  avatarUrl?: string | null;
};

const Header = ({ avatarUrl }: HeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "You have been signed out.",
      });
      navigate("/");
    }
  };

  return (
    <header className="border-b" role="banner">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and University Name */}
        <div className="flex items-center gap-3">
          <img src={StudyHubLogo} alt="Mekelle University Logo" className="h-10 object-contain" aria-label="Mekelle University Logo" />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Main navigation">
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/about" className="transition-colors hover:text-primary">
            About
          </Link>
          <Link to="/contact" className="transition-colors hover:text-primary">
            Contact
          </Link>
          <Link to="/help" className="transition-colors hover:text-primary">
            Help
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile">
                <button
                  className="inline-flex items-center justify-center rounded-md h-10 w-10 overflow-hidden hover:opacity-80 transition-opacity"
                  aria-label="Profile"
                  type="button"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  <span className="sr-only">Profile</span>
                </button>
              </Link>
              
              {isAdmin && (
                <Link to="/admin" aria-label="Admin dashboard">
                  <Button variant="outline" size="sm">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/upload" aria-label="Upload materials">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="hidden sm:flex"
                aria-label="Sign out"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSignOut}
                className="sm:hidden"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth" aria-label="Sign in to your account">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;