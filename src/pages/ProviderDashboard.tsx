import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProviderCalendar from "@/components/ProviderCalendar";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/services";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
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
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getCategoryIcon = (categoryId: string) =>
    serviceCategories.find((c) => c.id === categoryId)?.icon || "🔧";

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

        <Tabs defaultValue="calendar" className="mt-8">
          <TabsList>
            <TabsTrigger value="calendar">My Calendar</TabsTrigger>
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <ProviderCalendar />
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
