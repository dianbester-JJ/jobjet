import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { Plus, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEntry {
  id: string;
  title: string;
  entry_date: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  booking_id: string | null;
  booking?: {
    status: string;
    address: string | null;
    total_amount: number;
    customer_name?: string;
  };
}

const timeSlots = [
  "04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00",
];

const ProviderCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("08:00");
  const [newEndTime, setNewEndTime] = useState("09:00");
  const [newNotes, setNewNotes] = useState("");

  const fetchEntries = async () => {
    if (!user) return;

    // Fetch manual calendar entries
    const { data: calEntries } = await (supabase as any)
      .from("provider_calendar_entries")
      .select("*")
      .eq("provider_id", user.id);

    // Fetch confirmed/completed bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", user.id)
      .in("status", ["confirmed", "completed"]);

    const allEntries: CalendarEntry[] = (calEntries || []).map((e: any) => ({
      ...e,
      booking: null,
    }));

    // Add bookings that aren't already linked to calendar entries
    const linkedBookingIds = new Set((calEntries || []).filter((e: any) => e.booking_id).map((e: any) => e.booking_id));

    if (bookings) {
      // Get customer names
      const customerIds = [...new Set(bookings.map((b) => b.customer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", customerIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name || "Customer"]) || []);

      for (const b of bookings) {
        if (!linkedBookingIds.has(b.id)) {
          // Get listing title
          const { data: listing } = await supabase
            .from("provider_listings")
            .select("title")
            .eq("id", b.listing_id)
            .maybeSingle();

          allEntries.push({
            id: `booking-${b.id}`,
            title: listing?.title || "Booking",
            entry_date: b.service_date,
            start_time: b.service_time,
            end_time: null,
            notes: b.notes,
            booking_id: b.id,
            booking: {
              status: b.status,
              address: b.address,
              total_amount: b.total_amount,
              customer_name: profileMap.get(b.customer_id),
            },
          });
        }
      }
    }

    setEntries(allEntries);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const dayEntries = entries.filter((e) =>
    isSameDay(new Date(e.entry_date), selectedDate)
  );

  const datesWithEntries = entries.map((e) => new Date(e.entry_date));

  const handleAddEntry = async () => {
    if (!user || !newTitle.trim()) return;

    await (supabase as any).from("provider_calendar_entries").insert({
      provider_id: user.id,
      title: newTitle.trim(),
      entry_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: newStartTime,
      end_time: newEndTime,
      notes: newNotes.trim() || null,
    });

    toast({ title: "Entry added!" });
    setNewTitle("");
    setNewNotes("");
    setDialogOpen(false);
    fetchEntries();
  };

  const handleDeleteEntry = async (entry: CalendarEntry) => {
    if (entry.booking_id) return; // Can't delete auto-entries
    await (supabase as any)
      .from("provider_calendar_entries")
      .delete()
      .eq("id", entry.id);
    toast({ title: "Entry removed" });
    fetchEntries();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Calendar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          className={cn("p-3 pointer-events-auto")}
          modifiers={{ hasEntry: datesWithEntries }}
          modifiersStyles={{
            hasEntry: {
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary) / 0.15)",
              borderRadius: "50%",
            },
          }}
        />
      </div>

      {/* Day View */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Calendar Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Job description" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Select value={newStartTime} onValueChange={setNewStartTime}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Select value={newEndTime} onValueChange={setNewEndTime}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optional notes" className="mt-1" />
                </div>
                <Button className="w-full" onClick={handleAddEntry} disabled={!newTitle.trim()}>
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {dayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No entries for this day</p>
          ) : (
            dayEntries
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    entry.booking_id
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{entry.title}</p>
                    <div className="flex items-center gap-2">
                      {entry.booking_id && (
                        <Badge className="bg-primary/10 text-primary text-xs">Booking</Badge>
                      )}
                      {!entry.booking_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteEntry(entry)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {entry.start_time}{entry.end_time ? ` - ${entry.end_time}` : ""}
                  </p>
                  {entry.booking?.address && (
                    <p className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {entry.booking.address}
                    </p>
                  )}
                  {entry.booking?.customer_name && (
                    <p className="mt-1 text-muted-foreground">
                      Customer: {entry.booking.customer_name}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="mt-1 text-muted-foreground italic">{entry.notes}</p>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderCalendar;
