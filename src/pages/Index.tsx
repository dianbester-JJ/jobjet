import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Shield, Star, Clock } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import ServiceCategoryCard from "@/components/ServiceCategoryCard";
import ProviderCard from "@/components/ProviderCard";
import { serviceCategories, serviceProviders } from "@/data/services";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const featuredProviders = serviceProviders.slice(0, 4);

  return (
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

        <div className="container relative z-10 py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl animate-fade-in">
              Affordable, Reliable Service For Your Home
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 md:text-xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Connect with verified painters, plumbers, cleaners, and more across South Africa.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Link to="/services">
                <Button variant="hero" size="xl">
                  <Search className="mr-2 h-5 w-5" />
                  Find a Service
                </Button>
              </Link>
              <Link to="/become-provider">
                <Button variant="heroOutline" size="xl">
                  Join as a Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>Verified Professionals</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-5 w-5 text-primary" />
              <span>Ratings By Real Customers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>Book or Contact a Pro Directly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Browse by Service
            </h2>
            <p className="mt-3 text-muted-foreground">
              Explore our wide range of professional services
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((category) => (
              <ServiceCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Top Rated Pros
              </h2>
              <p className="mt-3 text-muted-foreground">
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
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
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="overflow-hidden rounded-2xl bg-gradient-hero p-8 text-center md:p-16">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Are You a Service Pro?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Join thousands of Pros growing their business on JobJet. Get verified, get noticed, get hired.
            </p>
            <Link to="/become-provider" className="mt-8 inline-block">
              <Button variant="heroOutline" size="xl">
                Start Your Pro Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Index;
