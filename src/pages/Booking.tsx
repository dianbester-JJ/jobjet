import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  category_id: string;
  hourly_rate: number;
  user_id: string;
  description: string;
  location: string;
}

interface Profile {
  full_name: string;
}

const timeSlots = [
  "04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00",
];

const Booking = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [providerProfile, setProviderProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [hours, setHours] = useState("2");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      const { data: listingData, error } = await supabase
        .from("provider_listings")
        .select("*")
        .eq("id", listingId)
        .maybeSingle();

      if (error || !listingData) {
        toast({ title: "Error", description: "Could not find this service listing.", variant: "destructive" });
        navigate("/services");
        return;
      }
      setListing(listingData);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", listingData.user_id)
        .maybeSingle();
      setProviderProfile(profileData);
      setLoading(false);
    };
    fetchListing();
  }, [listingId, navigate, toast]);

  const totalAmount = listing ? parseFloat(hours) * listing.hourly_rate : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !address || !listing || !user) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    // Create booking
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        provider_id: listing.user_id,
        listing_id: listing.id,
        service_date: format(date, "yyyy-MM-dd"),
        service_time: time,
        hours_requested: parseInt(hours),
        total_amount: totalAmount,
        address,
        notes,
        status: "pending",
      })
      .select("id")
      .single();

    if (bookingError || !bookingData) {
      toast({ title: "Request failed", description: "Could not submit your booking request.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Send booking request as a message
    await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: listing.user_id,
      listing_id: listing.id,
      booking_id: bookingData.id,
      content: message.trim() || "Booking request sent",
      message_type: "booking_request",
    });

    toast({ title: "Booking request sent!", description: "The Pro will see your request in their messages." });
    navigate(`/messages?with=${listing.user_id}`);
  };

  if (loading || authLoading) {
    return (
            <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
    <div className="min-h-screen bg-gradient-warm">
      
      <main className="container py-8">
        <Link to={`/listing/${listingId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listing
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Request a Booking
              </h1>
              <p className="mt-1 text-muted-foreground">
                Your request will be sent as a message — the Pro can accept or decline
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label>Preferred Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("mt-1 w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Preferred Time *</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select time" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Estimated Duration (hours) *</Label>
                  <Select value={hours} onValueChange={setHours}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((h) => (
                        <SelectItem key={h} value={h.toString()}>{h} hour{h > 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Service Address *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street, Cape Town" className="pl-10" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message to Pro (optional)</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the Pro what you need or add a personal message..." className="mt-1" rows={3} />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : (
                    <>Send Booking Request — R{totalAmount.toFixed(2)} est.</>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground">Request Summary</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="font-medium text-foreground">{listing?.title}</p>
                  <p className="text-sm text-muted-foreground">by {providerProfile?.full_name || "Pro"}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hourly rate</span>
                    <span>R{listing?.hourly_rate?.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{hours} hour{parseInt(hours) > 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Estimated Total</span>
                    <span className="text-primary">R{totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Final amount to be agreed with the Pro
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
    </AppLayout>
      );
};

export default Booking;
