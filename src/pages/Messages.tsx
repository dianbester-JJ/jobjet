import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Send, ArrowLeft, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  booking_id: string | null;
  content: string;
  is_quick_response: boolean;
  read: boolean;
  created_at: string;
}

interface Conversation {
  other_user_id: string;
  other_user_name: string;
  listing_title: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    searchParams.get("with")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

      // Group by other user
      const convMap = new Map<string, { messages: Message[]; listing_id: string | null }>();
      for (const msg of msgs) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, { messages: [], listing_id: msg.listing_id });
        }
        convMap.get(otherId)!.messages.push(msg);
      }

      // Fetch profile names
      const userIds = Array.from(convMap.keys());
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name || "User"]) || []);

      const convList: Conversation[] = [];
      for (const [otherId, data] of convMap) {
        const lastMsg = data.messages[0];
        const unread = data.messages.filter(
          (m) => m.receiver_id === user.id && !m.read
        ).length;

        convList.push({
          other_user_id: otherId,
          other_user_name: profileMap.get(otherId) || "User",
          listing_title: null,
          last_message: lastMsg.content,
          last_message_time: lastMsg.created_at,
          unread_count: unread,
        });
      }

      setConversations(convList);
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  // Fetch messages for active conversation
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

      // Mark as read
      if (data) {
        const unreadIds = data
          .filter((m) => m.receiver_id === user.id && !m.read)
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          await (supabase as any)
            .from("messages")
            .update({ read: true })
            .in("id", unreadIds);
        }
      }
    };

    fetchMessages();

    // Realtime subscription
    if (user && activeConversation) {
      const channel = supabase
        .channel(`messages-${activeConversation}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg = payload.new as Message;
            if (
              (msg.sender_id === user.id && msg.receiver_id === activeConversation) ||
              (msg.sender_id === activeConversation && msg.receiver_id === user.id)
            ) {
              setMessages((prev) => [...prev, msg]);
              if (msg.receiver_id === user.id) {
                (supabase as any).from("messages").update({ read: true }).eq("id", msg.id);
              }
            }
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
    });
    setNewMessage("");
    setSending(false);
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
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[75%] rounded-xl px-4 py-2",
                        msg.sender_id === user?.id
                          ? "ml-auto bg-primary text-primary-foreground"
                          : msg.is_quick_response
                          ? "bg-accent/20 border border-accent"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          msg.sender_id === user?.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {format(new Date(msg.created_at), "HH:mm")}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

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
