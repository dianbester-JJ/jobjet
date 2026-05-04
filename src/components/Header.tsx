import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, LogOut, Search, MessageSquare, Briefcase } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import jobjetLogo from "@/assets/jobjet-logo.png";
import { Input } from "@/components/ui/input";
import RoleSwitcher from "@/components/RoleSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BecomeProviderForm from "@/components/BecomeProviderForm";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [becomeProviderOpen, setBecomeProviderOpen] = useState(false);
  const { user, signOut, loading, isPro, roles } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <img src={jobjetLogo} alt="JobJet" className="h-20 w-auto object-contain" />
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
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-sm md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="pl-9 h-9"
              />
            </div>
          </form>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? null : user ? (
              <>
                {isPro ? (
                  <Link to="/provider/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/messages">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="mr-1 h-4 w-4" />
                      My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/personal-details" className="cursor-pointer">
                        Personal Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="cursor-pointer">
                        Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/help" className="cursor-pointer">
                        Help
                      </Link>
                    </DropdownMenuItem>
                    {!roles.includes("pro") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setBecomeProviderOpen(true)} className="cursor-pointer">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Become a Provider
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/auth?mode=signin">
                  <Button variant="outline" size="sm">
                    <User className="mr-1 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
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
              {/* Mobile Search */}
              <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="mb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="pl-9"
                  />
                </div>
              </form>

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
              {user && (
                <>
                  {roles.includes("pro") && (
                    <div className="px-3 py-2">
                      <RoleSwitcher />
                    </div>
                  )}
                  <Link to="/bookings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Bookings
                    </Button>
                  </Link>
                  <Link to="/personal-details" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Personal Details
                    </Button>
                  </Link>
                  <Link to="/help" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Help
                    </Button>
                  </Link>
                  {isPro ? (
                    <Link to="/provider/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Button>
                    </Link>
                  )}
                  {!roles.includes("pro") && (
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { setMobileMenuOpen(false); setBecomeProviderOpen(true); }}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Become a Provider
                    </Button>
                  )}
                </>
              )}
              <div className="mt-2 flex gap-2">
                {user ? (
                  <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/auth?mode=signin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth?mode=signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Become a Provider Dialog */}
      <Dialog open={becomeProviderOpen} onOpenChange={setBecomeProviderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-xl">
              Become a Provider
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center">
            Switching to a provider account lets you list your services and receive job requests. You can switch back to customer mode anytime.
          </p>
          <BecomeProviderForm onComplete={() => setBecomeProviderOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
