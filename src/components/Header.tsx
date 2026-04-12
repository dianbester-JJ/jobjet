import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, LogOut, Search, MessageSquare, Briefcase } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import jobjetLogo from "@/assets/jobjet-logo.png";
import { Input } from "@/components/ui/input";
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

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogMode, setRoleDialogMode] = useState<"signin" | "signup">("signin");
  const { user, signOut, loading, isProvider } = useAuth();

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

  const openRoleDialog = (mode: "signin" | "signup") => {
    setRoleDialogMode(mode);
    setRoleDialogOpen(true);
  };

  const handleRoleSelect = (role: "customer" | "pro") => {
    setRoleDialogOpen(false);
    if (role === "pro") {
      navigate(`/auth?mode=${roleDialogMode}&role=pro`);
    } else {
      navigate(`/auth?mode=${roleDialogMode}&role=customer`);
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
                {isProvider ? (
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
                  <DropdownMenuContent align="end" className="w-48">
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
                <Button variant="outline" size="sm" onClick={() => openRoleDialog("signin")}>
                  <User className="mr-1 h-4 w-4" />
                  Sign In
                </Button>
                <Button size="sm" onClick={() => openRoleDialog("signup")}>
                  Get Started
                </Button>
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
                  {isProvider ? (
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
                    <Button variant="outline" className="flex-1" onClick={() => { setMobileMenuOpen(false); openRoleDialog("signin"); }}>
                      Sign In
                    </Button>
                    <Button className="flex-1" onClick={() => { setMobileMenuOpen(false); openRoleDialog("signup"); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Role Selection Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-xl">
              {roleDialogMode === "signin" ? "Sign in as" : "Sign up as"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleRoleSelect("customer")}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 transition-all hover:border-primary hover:bg-primary/5"
            >
              <User className="h-10 w-10 text-primary" strokeWidth={1.5} />
              <span className="font-display text-lg font-semibold text-foreground">Customer</span>
              <span className="text-xs text-muted-foreground text-center">I need a service done</span>
            </button>
            <button
              onClick={() => handleRoleSelect("pro")}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border p-6 transition-all hover:border-primary hover:bg-primary/5"
            >
              <Briefcase className="h-10 w-10 text-primary" strokeWidth={1.5} />
              <span className="font-display text-lg font-semibold text-foreground">Pro</span>
              <span className="text-xs text-muted-foreground text-center">I offer services</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
