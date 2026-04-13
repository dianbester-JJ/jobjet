import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { serviceCategories } from "@/data/services";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatRate } from "@/lib/rateUtils";
import ReviewForm from "@/components/ReviewForm";
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
  Check,
  Send
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
  rate_type?: string | null;
  rate_unit?: string | null;
  working_hours_per_day?: number | null;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_id: string;
  image_urls: string[] | null;
}

interface EligibleBooking {
  id: string;
  service_date: string;
}

const ListingProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [providerProfile, setProviderProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewProfiles, setReviewProfiles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [sendingEnquiry, setSendingEnquiry] = useState(false);
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const category = listing ? serviceCategories.find((c) => c.id === listing.category_id) : null;

  const fetchReviews = async (providerId: string) => {
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      setReviews(reviewsData as Review[]);
      const customerIds = [...new Set(reviewsData.map(r => r.customer_id))];
      const { data: customerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", customerIds);
      if (customerProfiles) {
        setReviewProfiles(new Map(customerProfiles.map(p => [p.id, p.full_name || "Customer"])));
      }
    } else {
      setReviews([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", listingData.user_id)
        .maybeSingle();

      setProviderProfile(profileData);
      await fetchReviews(listingData.user_id);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Fetch eligible bookings for review (confirmed bookings with past/today service date, not yet reviewed)
  useEffect(() => {
    const fetchEligible = async () => {
      if (!user || !listing) return;

      const today = new Date().toISOString().split("T")[0];

      // Get confirmed bookings for this listing where customer is current user and service_date <= today
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, service_date")
        .eq("customer_id", user.id)
        .eq("listing_id", listing.id)
        .eq("status", "confirmed")
        .lte("service_date", today);

      if (!bookings || bookings.length === 0) {
        setEligibleBookings([]);
        return;
      }

      // Filter out bookings that already have a review
      const bookingIds = bookings.map(b => b.id);
      const { data: existingReviews } = await supabase
        .from("reviews")
        .select("booking_id")
        .in("booking_id", bookingIds);

      const reviewedIds = new Set((existingReviews || []).map(r => r.booking_id));
      const eligible = bookings.filter(b => !reviewedIds.has(b.id));
      setEligibleBookings(eligible);
      if (eligible.length === 1) setSelectedBookingId(eligible[0].id);
    };

    fetchEligible();
  }, [user, listing, reviews]);

  const handleCopyNumber = () => {
    if (providerProfile?.phone) {
      navigator.clipboard.writeText(providerProfile.phone);
      setCopied(true);
      toast({ title: "Copied!", description: "Phone number copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (providerProfile?.phone) {
      const cleanNumber = providerProfile.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    }
  };

  const handleSendEnquiry = async () => {
    if (!user) {
      navigate("/auth?mode=signin");
      return;
    }
    if (!enquiryMessage.trim() || !listing) return;

    setSendingEnquiry(true);
    const { error } = await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: listing.user_id,
      listing_id: listing.id,
      content: enquiryMessage.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Could not send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "The Pro will receive your message." });
      setEnquiryMessage("");
    }
    setSendingEnquiry(false);
  };

  const handleMessageProvider = () => {
    if (!user) {
      navigate("/auth?mode=signin");
      return;
    }
    navigate(`/messages?with=${listing?.user_id}`);
  };

  const handleReviewSubmitted = () => {
    if (listing) {
      fetchReviews(listing.user_id);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : null;

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
                <img src={listing.cover_photo_url} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <span className="text-lg font-medium text-muted-foreground">{category?.name || "Service"}</span>
                </div>
              )}
              {listing.verified && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Pro
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                      {category?.name}
                    </span>
                    {avgRating && (
                      <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        {avgRating} ({reviews.length})
                      </span>
                    )}
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

              {/* Enquiry Form */}
              <div className="mt-8 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Send an Enquiry</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Describe what you need and the Pro will get back to you
                </p>
                <Textarea
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="Hi, I'm interested in your service. I need help with..."
                  className="mt-4"
                  rows={4}
                />
                <Button
                  className="mt-3 w-full"
                  onClick={handleSendEnquiry}
                  disabled={sendingEnquiry || !enquiryMessage.trim()}
                >
                  {sendingEnquiry ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Enquiry
                    </>
                  )}
                </Button>
              </div>

              {/* Review Form - only if eligible */}
              {eligibleBookings.length > 0 && selectedBookingId && listing && (
                <div className="mt-8">
                  {eligibleBookings.length > 1 && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-foreground">Select booking to review:</label>
                      <select
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                      >
                        {eligibleBookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            Booking on {format(new Date(b.service_date), "PPP")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <ReviewForm
                    bookingId={selectedBookingId}
                    providerId={listing.user_id}
                    customerId={user!.id}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                </div>
              )}

              {/* Reviews Section */}
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>
                <div className="mt-4 space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No reviews yet for this provider.</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-medium text-muted-foreground">
                                {(reviewProfiles.get(review.customer_id) || "C")[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {reviewProfiles.get(review.customer_id) || "Customer"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(review.created_at), "PPP")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        {review.image_urls && review.image_urls.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {review.image_urls.map((url, i) => (
                              <button
                                key={i}
                                onClick={() => setExpandedImage(url)}
                                className="h-20 w-20 overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
                              >
                                <img src={url} alt="" className="h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="text-center">
              {(() => {
                const { amount, label, subtitle } = formatRate(listing.hourly_rate, listing.rate_type, listing.rate_unit, listing.working_hours_per_day);
                return (
                  <>
                    <div className="text-3xl font-bold text-foreground">{amount}</div>
                    <p className="text-muted-foreground">{label.replace("/", "per ")}</p>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                  </>
                );
              })()}
              </div>

              <div className="mt-6 space-y-3">
                <Link to={`/booking/${listing.id}`} className="block">
                  <Button className="w-full" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Request Booking
                  </Button>
                </Link>

                <Button variant="outline" className="w-full" size="lg" onClick={handleMessageProvider}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Pro
                </Button>
              </div>
            </div>

            {providerProfile?.phone && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="text-sm font-medium text-foreground mb-4">Contact Pro</p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                    onClick={handleWhatsApp}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleCopyNumber}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied!" : providerProfile.phone}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="Review image"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ListingProfile;
