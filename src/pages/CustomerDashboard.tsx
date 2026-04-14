import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Calendar, Clock, MapPin, Loader2, Search, User, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  service_date: string;
  service_time: string;
  hours_requested: number;
  total_amount: number;
  status: string;
  address: string;
  notes: string;
  created_at: string;
  listing: { title: string; category_id: string };
  provider: { full_name: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Awaiting Response",
  confirmed: "Accepted",
  completed: "Completed",
  cancelled: "Declined",
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, service_date, service_time, hours_requested, total_amount, status, address, notes, created_at, listing_id, provider_id")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (bookingsData) {
        const enriched = await Promise.all(
          bookingsData.map(async (booking) => {
            const { data: listing } = await supabase.from("provider_listings").select("title, category_id").eq("id", booking.listing_id).maybeSingle();
            const { data: provider } = await supabase.from("profiles").select("full_name").eq("id", booking.provider_id).maybeSingle();
            return {
              ...booking,
              listing: listing || { title: "Unknown Service", category_id: "" },
              provider: provider || { full_name: "Unknown Provider" },
            };
          })
        );
        setBookings(enriched);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const activeRequests = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const pastRequests = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  if (authLoading || loading) {
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
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{profile?.full_name || "My Account"}</h1>
              <p className="text-muted-foreground">{profile?.email || user?.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/messages">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Button>
            </Link>
            <Link to="/services">
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Find Services
              </Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active Requests ({activeRequests.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {activeRequests.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-display text-lg font-semibold">No active requests</h3>
                  <p className="mt-2 text-muted-foreground">Browse services and send a booking request or enquiry</p>
                  <Link to="/services" className="mt-4 inline-block"><Button>Browse Services</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequests.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastRequests.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-display text-lg font-semibold">No past requests</h3>
                  <p className="mt-2 text-muted-foreground">Your completed requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastRequests.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
    </div>
    </AppLayout>
  );
};

const BookingCard = ({ booking }: { booking: Booking }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-foreground">{booking.listing.title}</h3>
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status] || booking.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">by {booking.provider.full_name}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(booking.service_date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{booking.service_time} ({booking.hours_requested}h)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{booking.address}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">R{booking.total_amount.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">estimated</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
