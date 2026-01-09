import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isProvider = location.pathname.startsWith("/provider");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">ServiceHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/">
            <Button variant="ghost" size="sm" className={location.pathname === "/" ? "bg-accent" : ""}>
              Home
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="ghost" size="sm" className={location.pathname === "/services" ? "bg-accent" : ""}>
              Browse Services
            </Button>
          </Link>
          <Link to="/provider/dashboard">
            <Button variant="ghost" size="sm" className={isProvider ? "bg-accent" : ""}>
              <Briefcase className="mr-1 h-4 w-4" />
              For Providers
            </Button>
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" size="sm">
            <User className="mr-1 h-4 w-4" />
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link to="/services" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Browse Services
              </Button>
            </Link>
            <Link to="/provider/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                For Providers
              </Button>
            </Link>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="flex-1">
                Sign In
              </Button>
              <Button className="flex-1">Get Started</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
