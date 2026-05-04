import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { ArrowLeft, Loader2, Briefcase, Clock, ImagePlus, X, Trash2 } from "lucide-react";
import { serviceCategories } from "@/data/services";
import LocationSelector from "@/components/LocationSelector";
import ServiceRadiusMap from "@/components/ServiceRadiusMap";
import { Town } from "@/data/southAfricanTowns";
import { RateType, COMMON_CUSTOM_UNITS } from "@/lib/rateUtils";

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const resolvedUnit = rateUnit === "other" ? customUnitText : rateUnit;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?mode=signin");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!user || !id) return;
      const { data, error } = await supabase
        .from("provider_listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Error", description: "Listing not found or access denied.", variant: "destructive" });
        navigate("/provider/dashboard");
        return;
      }

      setTitle(data.title);
      setCategoryId(data.category_id);
      setDescription(data.description || "");
      setRate(String(data.hourly_rate));
      setRateType((data.rate_type as RateType) || "per_hour");
      setRateUnit(data.rate_unit || "");
      setWorkingHoursPerDay(data.working_hours_per_day ? String(data.working_hours_per_day) : "");
      setLocation(data.location || "");
      setServiceRadius(data.service_radius || 25);
      setYearsExperience(data.years_experience ? String(data.years_experience) : "");
      const cover = data.cover_photo_url ? [data.cover_photo_url] : [];
      const gallery = (data as any).gallery_urls || [];
      setImages([...cover, ...gallery]);
      if (data.latitude && data.longitude) {
        setSelectedTown({ name: data.location || "", lat: data.latitude, lng: data.longitude, province: "" });
      }
      setLoading(false);
    };
    fetchListing();
  }, [user, id]);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("listing-photos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleImagesAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadPhoto(file);
      if (url) newUrls.push(url);
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    if (!title || !categoryId || !rate || !location) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("provider_listings")
      .update({
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
        cover_photo_url: images[0] || null,
        gallery_urls: images.slice(1),
      } as any)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Could not update listing.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Listing updated!", description: "Your changes have been saved." });
    navigate("/provider/dashboard");
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
                  <h1 className="font-display text-2xl font-bold text-foreground">Edit Listing</h1>
                  <p className="text-muted-foreground">Update your service details and photos</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Listing Images */}
                <div>
                  <Label>Listing Images</Label>
                  <p className="mt-1 text-xs text-muted-foreground">The first image will be used as the cover photo.</p>
                  <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((url, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={url} alt={`Listing ${i + 1}`} className="h-full w-full rounded-lg object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label="Remove image"
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/70 text-background shadow hover:bg-muted-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                      <div className="text-center">
                        <ImagePlus className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="mt-1 text-xs text-muted-foreground">Add</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImagesAdd}
                      />
                    </label>
                  </div>
                  {uploading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Service Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" required />
                </div>

                <div>
                  <Label>Service Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
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
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={4} />
                </div>

                <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  <Label className="text-base font-semibold">Pricing *</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Rate Unit</Label>
                      <Select value={rateType} onValueChange={(v) => setRateType(v as RateType)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per_hour">Per Hour</SelectItem>
                          <SelectItem value="per_day">Per Day</SelectItem>
                          <SelectItem value="custom">Custom Unit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rate">Rate (ZAR) *</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">R</span>
                        <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="pl-10" min="0" required />
                      </div>
                    </div>
                  </div>

                  {rateType === "per_day" && (
                    <div>
                      <Label htmlFor="workingHours">Working Hours Per Day *</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="workingHours" type="number" value={workingHoursPerDay} onChange={(e) => setWorkingHoursPerDay(e.target.value)} className="pl-10" min="1" max="24" required />
                      </div>
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
                    <Input id="yearsExperience" type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="pl-10" min="0" />
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

                <Button type="submit" size="lg" className="w-full" disabled={submitting || uploading}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save Changes"
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

export default EditListing;
