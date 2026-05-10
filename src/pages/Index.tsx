import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Shield, Star, Clock } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import ServiceCategoryCard from "@/components/ServiceCategoryCard";
import ProviderCard from "@/components/ProviderCard";
import { serviceCategories, serviceProviders } from "@/data/services";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const featuredProviders = serviceProviders.slice(0, 4);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories ? serviceCategories : serviceCategories.slice(0, 6);

  return (
        <AppLayout>
        <div className="min-h-screen bg-gradient-warm">
      

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Home interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>

        <div className="container relative z-10 py-12 sm:py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-primary-foreground animate-fade-in">
              Affordable, Reliable Service For Your Home
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-primary-foreground/80 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Connect with verified painters, plumbers, cleaners, and more across South Africa.
            </p>

            <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/services">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Find a Service
                </Button>
              </Link>
              <Link to="/become-provider">
                <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                  Join as a Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-card py-4 sm:py-6">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10 md:gap-x-16">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Verified Professionals</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Ratings By Real Customers</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Book or Contact a Pro Directly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Browse by Service
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
              Explore our wide range of professional services
            </p>
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 grid gap-3 sm:gap-5 md:gap-6 grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category) => (
              <ServiceCategoryCard key={category.id} category={category} />
            ))}
          </div>
          {serviceCategories.length > 6 && (
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAllCategories ? "Show Less" : `More Categories (${serviceCategories.length - 6} more)`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Providers */}
      <section className="bg-muted/50 py-10 sm:py-14 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                Top Rated Pros
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground">
                Highly reviewed Pros in your area
              </p>
            </div>
            <Link to="/services" className="hidden md:block">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          <div className="mt-6 sm:mt-8 text-center md:hidden">
            <Link to="/services">
              <Button variant="outline">
                View All Pros
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container">
          <div className="overflow-hidden rounded-2xl bg-gradient-hero px-5 py-8 sm:px-6 sm:py-10 text-center md:px-12 md:py-14">
            <h2 className="font-display text-xl sm:text-2xl md:text-4xl font-bold text-primary-foreground">
              Are You a Service Pro?
            </h2>
            <p className="mx-auto mt-2 sm:mt-3 max-w-xl text-sm md:text-base text-primary-foreground/90">
              Join thousands of Pros growing their business on JobJet. Get verified, get noticed, get hired.
            </p>
            <Link to="/become-provider" className="mt-5 sm:mt-6 inline-block">
              <Button variant="heroOutline" size="lg">
                Start Your Pro Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
    </div>
        </AppLayout>
      );
};

export default Index;
