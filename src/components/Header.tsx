import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Upload, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b" role="banner">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and University Name */}
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold"
            aria-label="Mekelle University Logo"
          >
            MU
          </div>
          <Link to="/" className="text-xl font-bold" aria-label="Mekelle University Home">
            Mekelle University
          </Link>
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
              <Link to="/profile" aria-label="User profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
              
              {isAdmin && (
                <>
                  <Link to="/admin" aria-label="Admin dashboard">
                    <Button variant="outline" size="sm">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                  <Link to="/upload" aria-label="Upload materials">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </Link>
                </>
              )}
              
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