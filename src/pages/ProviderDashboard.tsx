import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus, Calendar, Clock, MapPin, Loader2, Briefcase, Star, DollarSign, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/services";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
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
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
    toast({ title: "Status updated" });
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
          <Link to="/create-listing">
            <Button><Plus className="mr-2 h-4 w-4" />Create Listing</Button>
          </Link>
        </div>

        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6 space-y-4">
            {bookings.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <p className="text-muted-foreground">No bookings yet. Create a listing to start.</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="rounded-xl border bg-card p-6">
                  <div className="flex justify-between">
                    <div>
                      <Badge className={statusColors[b.status]}>{b.status}</Badge>
                      <p className="mt-2">{format(new Date(b.service_date), "PPP")} at {b.service_time}</p>
                      <p className="text-sm text-muted-foreground">{b.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">R{b.total_amount}</p>
                      {b.status === "pending" && (
                        <Button size="sm" className="mt-2" onClick={() => handleUpdateStatus(b.id, "confirmed")}>Confirm</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="listings" className="mt-6 grid gap-4 md:grid-cols-2">
            {listings.length === 0 ? (
              <div className="col-span-2 rounded-xl border bg-card p-8 text-center">
                <p className="text-muted-foreground">No listings yet.</p>
                <Link to="/create-listing"><Button className="mt-4">Create Listing</Button></Link>
              </div>
            ) : (
              listings.map((l) => (
                <div key={l.id} className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(l.category_id)}</span>
                    <h3 className="font-semibold">{l.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{l.location}</p>
                  <p className="mt-2 font-semibold text-primary">R{l.hourly_rate}/hr</p>
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
