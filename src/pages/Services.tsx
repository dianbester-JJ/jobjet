import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProviderCard from "@/components/ProviderCard";
import { serviceCategories, serviceProviders } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = useMemo(() => {
    return serviceProviders.filter((provider) => {
      const matchesCategory = selectedCategory === "all" || provider.categoryId === selectedCategory;
      const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />

      <main className="container py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Browse Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find the perfect service provider for your project
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" className="md:hidden">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
          >
            All Services
          </Button>
          {serviceCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-muted-foreground">
          Showing {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""}
          {selectedCategory !== "all" && (
            <span> in {serviceCategories.find((c) => c.id === selectedCategory)?.name}</span>
          )}
        </div>

        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="text-4xl">🔍</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-foreground">No providers found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                handleCategoryChange("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Services;
