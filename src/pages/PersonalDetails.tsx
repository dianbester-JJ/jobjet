import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import BecomeProviderForm from "@/components/BecomeProviderForm";
import { Loader2, Save, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PersonalDetails = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, roles } = useAuth();
  const [becomeProviderOpen, setBecomeProviderOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, location")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

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
      <AppLayout>
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container max-w-lg py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Personal Details</h1>
        <p className="mt-1 text-muted-foreground">Manage your account information.</p>

        <div className="mt-6 space-y-4">
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

          {/* Become a Provider section */}
          {!roles.includes("pro") && (
            <div className="mt-8 rounded-xl border border-border p-5">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Become a Provider</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Switching to a provider account lets you list your services and receive job requests. You can switch back to customer mode anytime.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setBecomeProviderOpen(true)}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Become Provider Dialog */}
      <Dialog open={becomeProviderOpen} onOpenChange={setBecomeProviderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-xl">Become a Provider</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center">
            Switching to a provider account lets you list your services and receive job requests. You can switch back to customer mode anytime.
          </p>
          <BecomeProviderForm onComplete={() => setBecomeProviderOpen(false)} />
        </DialogContent>
      </Dialog>

      
    </div>
    </AppLayout>
  );
};

export default PersonalDetails;
