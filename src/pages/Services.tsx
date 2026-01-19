import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { serviceCategories } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  title: string;
  category_id: string;
  description: string | null;
  location: string | null;
  hourly_rate: number;
  years_experience: number | null;
  verified: boolean | null;
  cover_photo_url: string | null;
}

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from("provider_listings")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setListings(data);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesCategory = selectedCategory === "all" || listing.category_id === selectedCategory;
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

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
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing {filteredListings.length} provider{filteredListings.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && (
                <span> in {serviceCategories.find((c) => c.id === selectedCategory)?.name}</span>
              )}
            </>
          )}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-card p-4 animate-pulse">
                <div className="aspect-[16/10] rounded-lg bg-muted" />
                <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
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
