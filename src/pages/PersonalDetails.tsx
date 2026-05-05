import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Loader2, Save, Briefcase, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PersonalDetails = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, roles } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [deletionRequestedAt, setDeletionRequestedAt] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, location, deletion_requested_at")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setDeletionRequestedAt((data as any).deletion_requested_at ?? null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleRequestDeletion = async () => {
    if (!deletePassword) {
      toast({ title: "Password required", description: "Enter your password to confirm.", variant: "destructive" });
      return;
    }
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke("request-account-deletion", {
      body: { password: deletePassword },
    });
    setDeleting(false);
    setDeletePassword("");
    if (error || (data && data.error)) {
      toast({
        title: "Could not schedule deletion",
        description: (data?.error as string) || error?.message || "Please try again.",
        variant: "destructive",
      });
      return;
    }
    setDeletionRequestedAt(new Date().toISOString());
    toast({
      title: "Account deletion scheduled",
      description: "Your account will be deleted in 30 days. Sign in again any time before then to cancel.",
    });
  };

  const handleCancelDeletion = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ deletion_requested_at: null } as any)
      .eq("id", user.id);
    if (!error) {
      setDeletionRequestedAt(null);
      toast({ title: "Deletion cancelled", description: "Your account will not be deleted." });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, location })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your details have been updated." });
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
    <AppLayout>
    <div className="min-h-screen bg-background">
      
      <main className="container max-w-lg py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Personal Details</h1>
        <p className="mt-1 text-muted-foreground">Manage your account information.</p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-semibold text-foreground">
                {roles.includes("pro") ? "Pro Account" : "Customer Account"}
              </p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${roles.includes("pro") ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {roles.includes("pro") ? "Pro" : "Customer"}
            </span>
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27..." />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Cape Town" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>

          {/* Become a Pro section */}
          {!roles.includes("pro") && (
            <div className="mt-8 rounded-xl border border-border p-5">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Become a Pro</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Apply to offer your services on JobJet. Your application will be reviewed by an administrator and either approved or rejected — you'll be notified once a decision is made.
                  </p>
                  <Link to="/become-provider">
                    <Button variant="outline" size="sm" className="mt-3">
                      Apply to become a Pro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      
    </div>
    </AppLayout>
      );
};

export default PersonalDetails;
