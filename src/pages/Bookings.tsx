import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingRow {
  id: string;
  service_date: string;
  service_time: string;
  hours_requested: number;
  total_amount: number;
  status: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  listing_title: string;
  other_party_name: string;
  customer_id: string;
  provider_id: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Accepted", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Declined", className: "bg-red-100 text-red-800" },
};

const Bookings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isPro: isProvider } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      const field = isProvider ? "provider_id" : "customer_id";
      const { data } = await supabase
        .from("bookings")
        .select("id, service_date, service_time, hours_requested, total_amount, status, address, notes, created_at, listing_id, customer_id, provider_id")
        .eq(field, user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const enriched = await Promise.all(
          data.map(async (b) => {
            const { data: listing } = await supabase
              .from("provider_listings")
              .select("title")
              .eq("id", b.listing_id)
              .maybeSingle();
            const otherPartyId = isProvider ? b.customer_id : b.provider_id;
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", otherPartyId)
              .maybeSingle();
            return {
              ...b,
              listing_title: listing?.title || "Unknown Service",
              other_party_name: profile?.full_name || "Unknown",
            };
          })
        );
        setBookings(enriched);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user, isProvider]);

  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  // Dates that have confirmed bookings for calendar highlighting
  const bookedDates = activeBookings.map((b) => parseISO(b.service_date));

  // Bookings for the selected date
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const bookingsOnDate = activeBookings.filter((b) => b.service_date === selectedDateStr);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          {isProvider ? "Manage your upcoming and past bookings." : "View your bookings and requests."}
        </p>

        <Tabs defaultValue="calendar" className="mt-6">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-1.5 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Booking History ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="mt-6">
            <div className="grid gap-6 md:grid-cols-[auto_1fr]">
              <div className="rounded-xl border border-border bg-card p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className={cn("p-3 pointer-events-auto")}
                  modifiers={{ booked: bookedDates }}
                  modifiersStyles={{
                    booked: {
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      borderRadius: "50%",
                    },
                  }}
                />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                </h3>
                {bookingsOnDate.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No bookings on this date.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {bookingsOnDate.map((b) => (
                      <BookingItem key={b.id} booking={b} isProvider={isProvider} expanded={expandedId === b.id} onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="mt-6">
            {pendingBookings.length === 0 ? (
              <EmptyState message={isProvider ? "No pending booking requests." : "You have no pending requests."} />
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((b) => (
                  <BookingItem key={b.id} booking={b} isProvider={isProvider} expanded={expandedId === b.id} onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            {pastBookings.length === 0 ? (
              <EmptyState message="No booking history yet." />
            ) : (
              <div className="space-y-3">
                {pastBookings.map((b) => (
                  <BookingItem key={b.id} booking={b} isProvider={isProvider} expanded={expandedId === b.id} onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-border bg-card p-8 text-center">
    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
    <p className="mt-4 text-muted-foreground">{message}</p>
  </div>
);

const BookingItem = ({
  booking,
  isProvider,
  expanded,
  onToggle,
}: {
  booking: BookingRow;
  isProvider: boolean;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const status = statusConfig[booking.status] || { label: booking.status, className: "bg-muted text-muted-foreground" };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display font-semibold text-foreground">{booking.listing_title}</h4>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isProvider ? "Customer" : "Pro"}: {booking.other_party_name} · {format(parseISO(booking.service_date), "PP")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-primary">R{booking.total_amount.toFixed(2)}</span>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(parseISO(booking.service_date), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{booking.service_time} ({booking.hours_requested}h)</span>
          </div>
          {booking.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{booking.address}</span>
            </div>
          )}
          {booking.notes && (
            <p className="mt-1 text-sm">Note: {booking.notes}</p>
          )}
          <p className="text-xs text-muted-foreground">Requested {format(parseISO(booking.created_at), "PPP 'at' p")}</p>
        </div>
      )}
    </div>
  );
};

export default Bookings;
