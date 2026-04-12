import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import jobjetLogo from "@/assets/jobjet-logo.png";

const Footer = () => {
  const { user, roles } = useAuth();
  const showBecomePro = user && !roles.includes("pro");

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="inline-block">
              <img src={jobjetLogo} alt="JobJet" className="h-20 w-auto object-contain" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Affordable, Reliable Service For Your Home.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">For Customers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-primary transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/messages" className="hover:text-primary transition-colors">
                  Messages
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  Customer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">For Pros</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/become-provider" className="hover:text-primary transition-colors">
                  Join as a Pro
                </Link>
              </li>
              <li>
                <Link to="/provider/dashboard" className="hover:text-primary transition-colors">
                  Pro Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="hover:text-primary transition-colors">
                  Create a Listing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-primary transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link to="/personal-details" className="hover:text-primary transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Sign In / Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Become a Provider CTA for customers */}
        {showBecomePro && (
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <h3 className="font-display text-lg font-semibold text-foreground">Want to offer your services?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              List your skills, set your rates, and start receiving job requests from customers in your area.
            </p>
            <Link to="/become-provider">
              <button className="mt-3 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Become a Provider
              </button>
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2025 JobJet. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
