import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReviewForm from "@/components/ReviewForm";
import ListingCard from "@/components/ListingCard";
import ShareButton from "@/components/ShareButton";
import { Star, MapPin, Plus, Trash2, X, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_id: string;
  image_urls: string[] | null;
}

interface CompletedJob {
  id: string;
  title: string;
  description: string | null;
  image_urls: string[];
  completed_at: string | null;
  created_at: string;
}

interface EligibleBooking {
  id: string;
  service_date: string;
}

const ProProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewProfiles, setReviewProfiles] = useState<Map<string, string>>(new Map());
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Add-job dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobDate, setJobDate] = useState("");
  const [jobImages, setJobImages] = useState<File[]>([]);
  const [jobPreviews, setJobPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isOwner = user?.id === userId;

  const fetchAll = async () => {
    if (!userId) return;
    const [profileRes, listingsRes, reviewsRes, jobsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url, location").eq("id", userId).maybeSingle(),
      supabase.from("provider_listings").select("*").eq("user_id", userId).eq("approved", true),
      supabase.from("reviews").select("*").eq("provider_id", userId).order("created_at", { ascending: false }),
      supabase.from("completed_jobs").select("*").eq("provider_id", userId).order("created_at", { ascending: false }),
    ]);

    setProfile(profileRes.data);
    setListings(listingsRes.data || []);
    const reviewData = (reviewsRes.data || []) as Review[];
    setReviews(reviewData);
    setCompletedJobs((jobsRes.data || []) as CompletedJob[]);

    if (reviewData.length > 0) {
      const ids = [...new Set(reviewData.map((r) => r.customer_id))];
      const { data: customers } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      if (customers) {
        setReviewProfiles(new Map(customers.map((c) => [c.id, c.full_name || "Customer"])));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // eligible bookings for review (any confirmed past booking with this provider not yet reviewed)
  useEffect(() => {
    const run = async () => {
      if (!user || !userId || user.id === userId) {
        setEligibleBookings([]);
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, service_date")
        .eq("customer_id", user.id)
        .eq("provider_id", userId)
        .eq("status", "confirmed")
        .lte("service_date", today);

      if (!bookings || bookings.length === 0) {
        setEligibleBookings([]);
        return;
      }
      const ids = bookings.map((b) => b.id);
      const { data: existing } = await supabase.from("reviews").select("booking_id").in("booking_id", ids);
      const reviewed = new Set((existing || []).map((r) => r.booking_id));
      const eligible = bookings.filter((b) => !reviewed.has(b.id));
      setEligibleBookings(eligible);
      if (eligible.length === 1) setSelectedBookingId(eligible[0].id);
    };
    run();
  }, [user, userId, reviews]);

  const avgRating =
    reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setJobImages((prev) => [...prev, ...files]);
    setJobPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (idx: number) => {
    setJobImages((prev) => prev.filter((_, i) => i !== idx));
    setJobPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetDialog = () => {
    setJobTitle("");
    setJobDesc("");
    setJobDate("");
    setJobImages([]);
    setJobPreviews([]);
  };

  const handleSaveJob = async () => {
    if (!user || !jobTitle.trim()) return;
    setSaving(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of jobImages) {
        const ext = file.name.split(".").pop();
        const path = `completed-jobs/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("listing-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      const { error } = await supabase.from("completed_jobs").insert({
        provider_id: user.id,
        title: jobTitle.trim(),
        description: jobDesc.trim() || null,
        image_urls: uploadedUrls,
        completed_at: jobDate || null,
      });
      if (error) throw error;

      toast({ title: "Job posted", description: "Your completed job is now visible on your profile." });
      resetDialog();
      setDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not save job", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Delete this completed job?")) return;
    const { error } = await supabase.from("completed_jobs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setCompletedJobs((prev) => prev.filter((j) => j.id !== id));
    toast({ title: "Deleted" });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-3xl font-bold">Pro Not Found</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-warm">
        <main className="container py-8 md:py-12 space-y-10">
          {/* Header */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "Pro"} />
              <AvatarFallback className="text-2xl">
                {(profile.full_name || "P").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-foreground">
                {profile.full_name || "Pro"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {avgRating ? (
                    <>
                      <span className="font-medium text-foreground">{avgRating}</span>
                      <span>· {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
                    </>
                  ) : (
                    "No reviews yet"
                  )}
                </span>
              </div>
            </div>
            {isOwner && (
              <ShareButton
                title={`${profile.full_name || "Pro"} on JobJet`}
                text={`Check out ${profile.full_name || "this Pro"} on JobJet`}
                label="Share profile"
              />
            )}
          </div>

          {/* Listings */}
          {listings.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Listings</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Completed Jobs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Recently Completed Jobs
              </h2>
              {isOwner && (
                <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetDialog(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add a completed job</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="job-title">Title</Label>
                        <Input
                          id="job-title"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="e.g. Kitchen renovation in Cape Town"
                        />
                      </div>
                      <div>
                        <Label htmlFor="job-desc">Description (optional)</Label>
                        <Textarea
                          id="job-desc"
                          value={jobDesc}
                          onChange={(e) => setJobDesc(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="job-date">Completion date (optional)</Label>
                        <Input
                          id="job-date"
                          type="date"
                          value={jobDate}
                          onChange={(e) => setJobDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Photos</Label>
                        <Input type="file" accept="image/*" multiple onChange={handleImageSelect} />
                        {jobPreviews.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {jobPreviews.map((url, i) => (
                              <div key={i} className="relative">
                                <img src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeImage(i)}
                                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveJob} disabled={!jobTitle.trim() || saving}>
                        {saving ? "Saving..." : "Post job"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {completedJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed jobs posted yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedJobs.map((job) => (
                  <div key={job.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                    {job.image_urls.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedImage(job.image_urls[0])}
                        className="block aspect-video w-full overflow-hidden bg-muted"
                      >
                        <img src={job.image_urls[0]} alt={job.title} className="h-full w-full object-cover transition-transform hover:scale-105" />
                      </button>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {job.completed_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Completed {format(new Date(job.completed_at), "PPP")}
                        </p>
                      )}
                      {job.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
                      )}
                      {job.image_urls.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.image_urls.slice(1).map((url, i) => (
                            <button
                              key={i}
                              onClick={() => setExpandedImage(url)}
                              className="h-14 w-14 overflow-hidden rounded-md border border-border"
                            >
                              <img src={url} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Review form */}
          {eligibleBookings.length > 0 && selectedBookingId && (
            <section>
              {eligibleBookings.length > 1 && (
                <div className="mb-4">
                  <Label>Select booking to review:</Label>
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
                providerId={userId!}
                customerId={user!.id}
                onReviewSubmitted={fetchAll}
              />
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">
              Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h2>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
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
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= review.rating ? "fill-primary text-primary" : "text-muted"}`}
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
                            className="h-20 w-20 overflow-hidden rounded-lg border border-border hover:opacity-80"
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
          </section>
        </main>

        {expandedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <img
              src={expandedImage}
              alt=""
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProProfile;
