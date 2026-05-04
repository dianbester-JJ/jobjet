import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Loader2, Briefcase, Clock, ImagePlus, X } from "lucide-react";
import { serviceCategories } from "@/data/services";
import LocationSelector from "@/components/LocationSelector";
import ServiceRadiusMap from "@/components/ServiceRadiusMap";
import { Town } from "@/data/southAfricanTowns";
import { RateType, COMMON_CUSTOM_UNITS } from "@/lib/rateUtils";

const CreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const [rateType, setRateType] = useState<RateType>("per_hour");
  const [rateUnit, setRateUnit] = useState("");
  const [customUnitText, setCustomUnitText] = useState("");
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const [serviceRadius, setServiceRadius] = useState(25);
  const [yearsExperience, setYearsExperience] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolvedUnit = rateUnit === "other" ? customUnitText : rateUnit;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in to create a listing.", variant: "destructive" });
      return;
    }

    if (!title || !categoryId || !rate || !location) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (rateType === "per_day" && !workingHoursPerDay) {
      toast({ title: "Missing information", description: "Please specify working hours per day.", variant: "destructive" });
      return;
    }

    if (rateType === "custom" && !resolvedUnit) {
      toast({ title: "Missing information", description: "Please specify the rate unit.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "provider")
      .maybeSingle();

    if (!existingRole) {
      await supabase.from("user_roles").insert({ user_id: user.id, role: "provider" });
    }

    const { error } = await supabase.from("provider_listings").insert({
      user_id: user.id,
      title,
      category_id: categoryId,
      description,
      hourly_rate: parseFloat(rate),
      rate_type: rateType,
      rate_unit: rateType === "custom" ? resolvedUnit : null,
      working_hours_per_day: rateType === "per_day" ? parseInt(workingHoursPerDay) : null,
      location,
      latitude: selectedTown?.lat,
      longitude: selectedTown?.lng,
      service_radius: serviceRadius,
      years_experience: yearsExperience ? parseInt(yearsExperience) : 0,
      approved: false,
    });

    if (error) {
      toast({ title: "Error", description: "Could not create your listing. Please try again.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Listing submitted!", description: "Your listing will be reviewed and approved shortly." });
    navigate("/provider/dashboard");
  };

  if (authLoading) {
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
        <Link to="/provider/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Create Service Listing</h1>
                <p className="text-muted-foreground">List your service and start getting bookings</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <Label htmlFor="title">Service Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Professional House Painting" className="mt-1" required />
              </div>

              <div>
                <Label>Service Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your service, experience, and what makes you stand out..." className="mt-1" rows={4} />
              </div>

              {/* Rate Section */}
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                <Label className="text-base font-semibold">Pricing *</Label>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Rate Unit</Label>
                    <Select value={rateType} onValueChange={(v) => setRateType(v as RateType)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_hour">Per Hour</SelectItem>
                        <SelectItem value="per_day">Per Day</SelectItem>
                        <SelectItem value="custom">Custom Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rate">
                      Rate (ZAR) *
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R</span>
                      <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="150" className="pl-10" min="0" required />
                    </div>
                  </div>
                </div>

                {rateType === "per_day" && (
                  <div>
                    <Label htmlFor="workingHours">Working Hours Per Day *</Label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="workingHours"
                        type="number"
                        value={workingHoursPerDay}
                        onChange={(e) => setWorkingHoursPerDay(e.target.value)}
                        placeholder="8"
                        className="pl-10"
                        min="1"
                        max="24"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">This will be visible on your listing so customers know what to expect</p>
                  </div>
                )}

              {rateType === "custom" && (
                  <div>
                    <Label htmlFor="customUnit">Custom Unit *</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">per</span>
                      <Input
                        id="customUnit"
                        value={customUnitText}
                        onChange={(e) => setCustomUnitText(e.target.value)}
                        placeholder='e.g., metre, bag, room'
                        className="flex-1"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">This will show as "per [your unit]" on your listing</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="yearsExperience" type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="5" className="pl-10" min="0" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Service Area *</Label>
                  <div className="mt-1">
                    <LocationSelector value={location} onChange={(value, town) => { setLocation(value); setSelectedTown(town || null); }} placeholder="Select your service area..." />
                  </div>
                </div>
                <ServiceRadiusMap selectedTown={selectedTown} radius={serviceRadius} onRadiusChange={setServiceRadius} />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating listing...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      
    </div>
    </AppLayout>
      );
};

export default CreateListing;
