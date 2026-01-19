import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { serviceCategories } from "@/data/services";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MapPin, 
  Clock, 
  BadgeCheck, 
  ArrowLeft,
  Calendar,
  MessageSquare,
  Phone,
  Copy,
  Check
} from "lucide-react";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  category_id: string;
  description: string | null;
  location: string | null;
  hourly_rate: number;
  years_experience: number | null;
  verified: boolean | null;
  cover_photo_url: string | null;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

interface Booking {
  id: string;
  status: string;
}

const ListingProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [providerProfile, setProviderProfile] = useState<Profile | null>(null);
  const [hasBooking, setHasBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const category = listing ? serviceCategories.find((c) => c.id === listing.category_id) : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from("provider_listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (listingError || !listingData) {
        setLoading(false);
        return;
      }

      setListing(listingData);

      // Fetch provider profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", listingData.user_id)
        .maybeSingle();

      setProviderProfile(profileData);

      // Check if current user has a confirmed booking with this listing
      if (user) {
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("id, status")
          .eq("listing_id", id)
          .eq("customer_id", user.id)
          .in("status", ["confirmed", "completed"])
          .limit(1);

        setHasBooking((bookingData && bookingData.length > 0) || false);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, user]);

  const handleCopyNumber = () => {
    if (providerProfile?.phone) {
      navigator.clipboard.writeText(providerProfile.phone);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Phone number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (providerProfile?.phone) {
      const cleanNumber = providerProfile.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <Header />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Listing Not Found</h1>
          <p className="mt-4 text-muted-foreground">The listing you're looking for doesn't exist.</p>
          <Link to="/services">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />

      <main className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <Link
          to="/services"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Services
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cover Photo */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              {listing.cover_photo_url ? (
                <img
                  src={listing.cover_photo_url}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">{category?.icon || "🔧"}</span>
                </div>
              )}
              {listing.verified && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Provider
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                      {category?.icon} {category?.name}
                    </span>
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
                    {listing.title}
                  </h1>
                  {providerProfile?.full_name && (
                    <p className="mt-1 text-muted-foreground">by {providerProfile.full_name}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                {listing.location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </span>
                )}
                {listing.years_experience && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {listing.years_experience} years experience
                  </span>
                )}
              </div>

              {listing.description && (
                <div className="mt-6">
                  <h2 className="font-display text-xl font-semibold text-foreground">About</h2>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Reviews Section - Placeholder */}
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold text-foreground">Reviews</h2>
                <div className="mt-4 space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted" />
                          <div>
                            <p className="font-medium text-foreground">Happy Customer</p>
                            <p className="text-xs text-muted-foreground">2 weeks ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 fill-primary text-primary"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Excellent work! Professional, on time, and the quality exceeded my expectations. 
                        Would highly recommend to anyone looking for this service.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">R{listing.hourly_rate}</div>
                <p className="text-muted-foreground">per hour</p>
              </div>

              <div className="mt-6 space-y-3">
                <Link to={`/booking/${listing.id}`} className="block">
                  <Button className="w-full" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </Link>
              </div>

              {/* Contact options - only shown after confirmed booking */}
              {hasBooking && providerProfile?.phone && (
                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <p className="text-center text-sm font-medium text-foreground mb-4">
                    Contact Provider
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                    onClick={handleWhatsApp}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCopyNumber}
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy Number"}
                  </Button>
                  <Link to="/dashboard" className="block">
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </Link>
                </div>
              )}

              {!hasBooking && (
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Book an appointment to get provider contact details
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingProfile;
