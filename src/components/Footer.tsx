import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <span className="text-lg font-bold text-primary-foreground">T</span>
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">Taska</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Affordable, Reliable Service For Your Home.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-primary">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary">
                  Trust & Safety
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">For Providers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/provider/dashboard" className="hover:text-primary">
                  Join as Provider
                </Link>
              </li>
              <li>
                <Link to="/provider/dashboard" className="hover:text-primary">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2025 Taska. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
