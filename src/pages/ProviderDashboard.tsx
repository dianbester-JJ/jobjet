import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus, Calendar, Clock, MapPin, Loader2, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/services";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const quickResponses = [
  "Good day, I am available for your requested timeslot. What is your contact number and address?",
  "Good day, unfortunately I am not available on your requested timeslot. Would another day work?",
  "Thank you for your interest! I can do the job. Let me know when suits you best.",
  "I'm currently fully booked but will have availability next week. Would that work?",
];

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingCustomers, setBookingCustomers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: listingsData } = await supabase
        .from("provider_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setListings(listingsData || []);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      setBookings(bookingsData || []);

      // Fetch customer names
      if (bookingsData && bookingsData.length > 0) {
        const customerIds = [...new Set(bookingsData.map(b => b.customer_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", customerIds);
        if (profiles) {
          setBookingCustomers(new Map(profiles.map(p => [p.id, p.full_name || "Customer"])));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
    toast({ title: `Booking ${newStatus}` });
  };

  const handleQuickResponse = async (booking: any, message: string) => {
    if (!user) return;
    await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: booking.customer_id,
      booking_id: booking.id,
      listing_id: booking.listing_id,
      content: message,
      is_quick_response: true,
    });
    toast({ title: "Response sent!", description: "Your message has been sent to the customer." });
  };

  const getCategoryIcon = (categoryId: string) => serviceCategories.find((c) => c.id === categoryId)?.icon || "🔧";

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Provider Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/messages">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Button>
            </Link>
            <Link to="/create-listing">
              <Button><Plus className="mr-2 h-4 w-4" />Create Listing</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mt-8">
          <TabsList>
            <TabsTrigger value="requests">
              Booking Requests ({bookings.filter(b => b.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="all-bookings">All Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6 space-y-4">
            {bookings.filter(b => b.status === "pending").length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">No pending booking requests.</p>
              </div>
            ) : (
              bookings.filter(b => b.status === "pending").map((b) => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[b.status]}>{b.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          from {bookingCustomers.get(b.customer_id) || "Customer"}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(b.service_date), "PPP")} at {b.service_time}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {b.address || "No address provided"}
                      </p>
                      {b.notes && (
                        <p className="mt-2 text-sm text-muted-foreground italic">"{b.notes}"</p>
                      )}
                      <p className="mt-2 text-lg font-bold text-primary">R{b.total_amount} est.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => handleUpdateStatus(b.id, "confirmed")}>
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(b.id, "cancelled")}>
                        <XCircle className="mr-1 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>

                  {/* Quick Response Buttons */}
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Quick Response:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickResponses.map((msg, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5 whitespace-normal text-left"
                          onClick={() => handleQuickResponse(b, msg)}
                        >
                          {msg.length > 50 ? msg.substring(0, 50) + "..." : msg}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="all-bookings" className="mt-6 space-y-4">
            {bookings.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">No bookings yet.</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[b.status]}>{b.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {bookingCustomers.get(b.customer_id) || "Customer"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{format(new Date(b.service_date), "PPP")} at {b.service_time}</p>
                      <p className="text-sm text-muted-foreground">{b.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">R{b.total_amount}</p>
                      {b.status === "confirmed" && (
                        <Button size="sm" className="mt-2" onClick={() => handleUpdateStatus(b.id, "completed")}>
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="listings" className="mt-6 grid gap-4 md:grid-cols-2">
            {listings.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">No listings yet.</p>
                <Link to="/create-listing"><Button className="mt-4">Create Listing</Button></Link>
              </div>
            ) : (
              listings.map((l) => (
                <div key={l.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(l.category_id)}</span>
                      <h3 className="font-semibold">{l.title}</h3>
                    </div>
                    {l.approved ? (
                      <Badge className="bg-green-100 text-green-800">Live</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{l.location}</p>
                  <p className="mt-2 font-semibold text-primary">R{l.hourly_rate}/hr</p>
                  {!l.approved && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your listing is being reviewed and will be visible once approved.
                    </p>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderDashboard;
