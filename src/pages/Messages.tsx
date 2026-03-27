import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingRequestCard from "@/components/BookingRequestCard";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  booking_id: string | null;
  content: string;
  message_type: string;
  is_quick_response: boolean;
  read: boolean;
  created_at: string;
}

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface BookingData {
  id: string;
  service_date: string;
  service_time: string;
  hours_requested: number;
  total_amount: number;
  status: string;
  address: string | null;
  notes: string | null;
  listing_title?: string;
}

const quickResponses = [
  "Good day, I am available for your requested timeslot. What is your contact number and address?",
  "Good day, unfortunately I am not available on your requested timeslot. Would another day work?",
  "Thank you for your interest! I can do the job. Let me know when suits you best.",
  "I'm currently fully booked but will have availability next week. Would that work?",
];

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    searchParams.get("with")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookingMap, setBookingMap] = useState<Map<string, BookingData>>(new Map());
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isProviderInConv, setIsProviderInConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      const { data: msgs } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs || msgs.length === 0) {
        setLoading(false);
        return;
      }

      const convMap = new Map<string, Message[]>();
      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(otherId)) convMap.set(otherId, []);
        convMap.get(otherId)!.push(msg);
      }

      const userIds = Array.from(convMap.keys());
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name || "User"]) || []);

      const convList: Conversation[] = [];
      for (const [otherId, data] of convMap) {
        const lastMsg = data[0];
        const unread = data.filter((m) => m.receiver_id === user.id && !m.read).length;
        convList.push({
          other_user_id: otherId,
          other_user_name: profileMap.get(otherId) || "User",
          last_message: lastMsg.message_type === "booking_request"
            ? "📋 Booking Request"
            : lastMsg.content,
          last_message_time: lastMsg.created_at,
          unread_count: unread,
        });
      }

      setConversations(convList);
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  // Fetch messages + bookings for active conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !activeConversation) return;

      const { data } = await (supabase as any)
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${activeConversation}),and(sender_id.eq.${activeConversation},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(data || []);

      // Load booking data for booking_request messages
      if (data) {
        const bookingIds = [...new Set(data.filter((m: Message) => m.booking_id).map((m: Message) => m.booking_id))];
        if (bookingIds.length > 0) {
          const { data: bookings } = await supabase
            .from("bookings")
            .select("*")
            .in("id", bookingIds);
          if (bookings) {
            const bMap = new Map<string, BookingData>();
            for (const b of bookings) {
              const { data: listing } = await supabase
                .from("provider_listings")
                .select("title")
                .eq("id", b.listing_id)
                .maybeSingle();
              bMap.set(b.id, { ...b, listing_title: listing?.title });
            }
            setBookingMap(bMap);
          }
        }

        // Mark unread as read
        const unreadIds = data
          .filter((m: Message) => m.receiver_id === user.id && !m.read)
          .map((m: Message) => m.id);
        if (unreadIds.length > 0) {
          await (supabase as any)
            .from("messages")
            .update({ read: true })
            .in("id", unreadIds);
        }
      }

      // Check if current user is the provider in this conversation
      const { data: providerListings } = await supabase
        .from("provider_listings")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      setIsProviderInConv(!!providerListings && providerListings.length > 0);
    };

    fetchMessages();

    // Realtime
    if (user && activeConversation) {
      const channel = supabase
        .channel(`messages-${activeConversation}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          async (payload) => {
            const msg = payload.new as Message;
            if (
              (msg.sender_id === user.id && msg.receiver_id === activeConversation) ||
              (msg.sender_id === activeConversation && msg.receiver_id === user.id)
            ) {
              setMessages((prev) => [...prev, msg]);
              if (msg.receiver_id === user.id) {
                await (supabase as any).from("messages").update({ read: true }).eq("id", msg.id);
              }
              // Load booking if needed
              if (msg.booking_id) {
                const { data: b } = await supabase.from("bookings").select("*").eq("id", msg.booking_id).maybeSingle();
                if (b) {
                  const { data: listing } = await supabase.from("provider_listings").select("title").eq("id", b.listing_id).maybeSingle();
                  setBookingMap((prev) => new Map(prev).set(b.id, { ...b, listing_title: listing?.title }));
                }
              }
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "bookings" },
          (payload) => {
            const updated = payload.new as any;
            setBookingMap((prev) => {
              const next = new Map(prev);
              const existing = next.get(updated.id);
              if (existing) next.set(updated.id, { ...existing, status: updated.status });
              return next;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !activeConversation || sending) return;
    setSending(true);
    await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: activeConversation,
      content: newMessage.trim(),
      message_type: "text",
    });
    setNewMessage("");
    setSending(false);
  };

  const handleQuickResponse = async (msg: string) => {
    if (!user || !activeConversation) return;
    await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: activeConversation,
      content: msg,
      message_type: "text",
      is_quick_response: true,
    });
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!user || !activeConversation) return;
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);
    // Send system message
    await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: activeConversation,
      booking_id: bookingId,
      content: "✅ Booking request accepted!",
      message_type: "booking_accepted",
    });
    // Auto-create calendar entry
    const booking = bookingMap.get(bookingId);
    if (booking) {
      await (supabase as any).from("provider_calendar_entries").insert({
        provider_id: user.id,
        title: booking.listing_title || "Booking",
        entry_date: booking.service_date,
        start_time: booking.service_time,
        booking_id: bookingId,
        notes: booking.notes,
      });
    }
    toast({ title: "Booking accepted!", description: "Added to your calendar." });
  };

  const handleDeclineBooking = async (bookingId: string) => {
    if (!user || !activeConversation) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    await (supabase as any).from("messages").insert({
      sender_id: user.id,
      receiver_id: activeConversation,
      booking_id: bookingId,
      content: "❌ Booking request declined.",
      message_type: "booking_declined",
    });
    toast({ title: "Booking declined" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Messages</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversation List */}
          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.other_user_id}
                    onClick={() => setActiveConversation(conv.other_user_id)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      activeConversation === conv.other_user_id && "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">
                        {conv.other_user_name}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {conv.last_message}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-card flex flex-col" style={{ minHeight: "500px" }}>
            {!activeConversation ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id;

                    // Booking request card
                    if (msg.message_type === "booking_request" && msg.booking_id) {
                      const booking = bookingMap.get(msg.booking_id);
                      return (
                        <div key={msg.id} className={cn("max-w-[85%]", isMine ? "ml-auto" : "")}>
                          {booking ? (
                            <BookingRequestCard
                              booking={booking}
                              isProvider={!isMine && isProviderInConv}
                              onAccept={handleAcceptBooking}
                              onDecline={handleDeclineBooking}
                            />
                          ) : (
                            <div className="rounded-xl bg-muted p-3 text-sm">Loading booking...</div>
                          )}
                          {msg.content && msg.content !== "Booking request sent" && (
                            <div className={cn(
                              "mt-2 rounded-xl px-4 py-2 text-sm",
                              isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              {msg.content}
                            </div>
                          )}
                          <p className="text-[10px] mt-1 text-muted-foreground">
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                      );
                    }

                    // System messages (accepted/declined)
                    if (msg.message_type === "booking_accepted" || msg.message_type === "booking_declined") {
                      return (
                        <div key={msg.id} className="text-center">
                          <span className="inline-block rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    // Regular message
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "max-w-[75%] rounded-xl px-4 py-2",
                          isMine
                            ? "ml-auto bg-primary text-primary-foreground"
                            : msg.is_quick_response
                            ? "bg-accent/20 border border-accent"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {format(new Date(msg.created_at), "HH:mm")}
                        </p>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Responses (for providers) */}
                {isProviderInConv && (
                  <div className="border-t border-border px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Quick responses:</p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {quickResponses.map((msg, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 px-2 whitespace-nowrap shrink-0"
                          onClick={() => handleQuickResponse(msg)}
                        >
                          {msg.length > 40 ? msg.substring(0, 40) + "..." : msg}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
