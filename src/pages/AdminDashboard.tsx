import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import {
  Loader2,
  Check,
  X,
  User,
  FileText,
  Phone,
  Image,
  AlertTriangle,
  Shield,
  MapPin,
  DollarSign,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [vettingSubmissions, setVettingSubmissions] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setCheckingAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("admin_emails")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();

      setIsAdmin(!!data);
      setCheckingAdmin(false);
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    } else if (!checkingAdmin && !isAdmin && user) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, isAdmin, checkingAdmin, navigate, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      const { data: vettingData } = await supabase
        .from("vetting_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      setVettingSubmissions(vettingData || []);

      const { data: listingsData } = await supabase
        .from("provider_listings")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });

      // Fetch profile info for each listing
      if (listingsData && listingsData.length > 0) {
        const userIds = [...new Set(listingsData.map((l) => l.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
        const listingsWithProfiles = listingsData.map((listing) => ({
          ...listing,
          profiles: profilesMap.get(listing.user_id) || null,
        }));
        setPendingListings(listingsWithProfiles);
      } else {
        setPendingListings([]);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleVettingAction = async (
    submissionId: string,
    action: "approved" | "rejected"
  ) => {
    setProcessing(true);
    const { error } = await supabase
      .from("vetting_submissions")
      .update({
        status: action,
        admin_notes: adminNotes,
      })
      .eq("id", submissionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update submission.",
        variant: "destructive",
      });
    } else {
      toast({
        title: action === "approved" ? "Provider Approved" : "Provider Rejected",
        description: `The vetting submission has been ${action}.`,
      });
      setVettingSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, status: action, admin_notes: adminNotes } : s
        )
      );
      setSelectedSubmission(null);
      setAdminNotes("");
    }
    setProcessing(false);
  };

  const handleListingAction = async (
    listingId: string,
    action: "approve" | "reject"
  ) => {
    setProcessing(true);
    
    if (action === "approve") {
      const { error } = await supabase
        .from("provider_listings")
        .update({
          approved: true,
          admin_notes: adminNotes,
        })
        .eq("id", listingId);

      if (error) {
        toast({ title: "Error", description: "Failed to approve listing.", variant: "destructive" });
      } else {
        toast({ title: "Listing Approved", description: "The listing is now live." });
        setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
        setSelectedListing(null);
        setAdminNotes("");
      }
    } else {
      const { error } = await supabase
        .from("provider_listings")
        .delete()
        .eq("id", listingId);

      if (error) {
        toast({ title: "Error", description: "Failed to reject listing.", variant: "destructive" });
      } else {
        toast({ title: "Listing Rejected", description: "The listing has been removed." });
        setPendingListings((prev) => prev.filter((l) => l.id !== listingId));
        setSelectedListing(null);
        setAdminNotes("");
      }
    }
    setProcessing(false);
  };

  const getCategoryName = (categoryId: string) =>
    serviceCategories.find((c) => c.id === categoryId)?.name || categoryId;

  const pendingVetting = vettingSubmissions.filter((s) => s.status === "pending");
  const processedVetting = vettingSubmissions.filter((s) => s.status !== "pending");

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      
      <main className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Review and approve providers and listings
            </p>
          </div>
        </div>

        <Tabs defaultValue="vetting" className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="vetting" className="relative">
              Provider Vetting
              {pendingVetting.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {pendingVetting.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="relative">
              Pending Listings
              {pendingListings.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {pendingListings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vetting" className="mt-6 space-y-6">
            {pendingVetting.length === 0 && processedVetting.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No vetting submissions yet.
                </p>
              </div>
            ) : (
              <>
                {pendingVetting.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Pending Review ({pendingVetting.length})
                    </h2>
                    <div className="space-y-4">
                      {pendingVetting.map((submission) => (
                        <VettingCard
                          key={submission.id}
                          submission={submission}
                          onView={() => setSelectedSubmission(submission)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {processedVetting.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Processed ({processedVetting.length})
                    </h2>
                    <div className="space-y-4">
                      {processedVetting.map((submission) => (
                        <VettingCard
                          key={submission.id}
                          submission={submission}
                          onView={() => setSelectedSubmission(submission)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="listings" className="mt-6 space-y-4">
            {pendingListings.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No pending listings to review.
                </p>
              </div>
            ) : (
              pendingListings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getCategoryName(listing.category_id)}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                      <h3 className="mt-2 font-semibold text-lg">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {listing.profiles?.full_name || listing.profiles?.email || "Unknown"}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R{listing.hourly_rate}/hr
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      

      {/* Vetting Submission Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => {
          setSelectedSubmission(null);
          setAdminNotes("");
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Vetting Submission Review
            </DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[selectedSubmission.status]}>
                  {selectedSubmission.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted {format(new Date(selectedSubmission.created_at), "PPP")}
                </span>
              </div>

              <div className="grid gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedSubmission.full_name}</p>
                    <p><strong>ID Number:</strong> {selectedSubmission.id_number}</p>
                  </div>
                </div>

                {selectedSubmission.id_photo_url && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      ID Photo
                    </h4>
                    <img
                      src={selectedSubmission.id_photo_url}
                      alt="ID Document"
                      className="mt-2 max-w-full rounded-lg border"
                    />
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    {selectedSubmission.has_criminal_history ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    Criminal History
                  </h4>
                  <div className="mt-2 text-sm">
                    {selectedSubmission.has_criminal_history ? (
                      <p className="text-yellow-700">
                        <strong>Yes</strong> - {selectedSubmission.criminal_offence}
                      </p>
                    ) : (
                      <p className="text-green-700">No criminal history declared</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Services
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSubmission.services.map((service: string) => (
                      <Badge key={service} variant="secondary">
                        {serviceCategories.find((c) => c.id === service)?.name || service}
                      </Badge>
                    ))}
                    {selectedSubmission.other_service && (
                      <Badge variant="outline">
                        Other: {selectedSubmission.other_service}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    {selectedSubmission.verification_method === "referrals" ? (
                      <Phone className="h-4 w-4" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                    Verification ({selectedSubmission.verification_method})
                  </h4>
                  <div className="mt-2">
                    {selectedSubmission.verification_method === "referrals" ? (
                      <ul className="text-sm space-y-1">
                        {selectedSubmission.referral_numbers?.map(
                          (num: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {num}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedSubmission.job_photo_urls?.map(
                          (url: string, i: number) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Job ${i + 1}`}
                              className="rounded-lg border aspect-square object-cover"
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSubmission.status === "pending" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">Admin Notes (optional)</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about this decision..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        handleVettingAction(selectedSubmission.id, "approved")
                      }
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve Provider
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() =>
                        handleVettingAction(selectedSubmission.id, "rejected")
                      }
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {selectedSubmission.admin_notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">Admin Notes</h4>
                  <p className="mt-1 text-sm text-blue-800">
                    {selectedSubmission.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Listing Review Dialog */}
      <Dialog
        open={!!selectedListing}
        onOpenChange={() => {
          setSelectedListing(null);
          setAdminNotes("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Listing Review
            </DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div>
                <Badge variant="outline">
                  {getCategoryName(selectedListing.category_id)}
                </Badge>
                <h3 className="mt-2 text-xl font-semibold">
                  {selectedListing.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  by {selectedListing.profiles?.full_name || selectedListing.profiles?.email}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {selectedListing.location}
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  R{selectedListing.hourly_rate}/hr
                </p>
                {selectedListing.years_experience > 0 && (
                  <p>{selectedListing.years_experience} years experience</p>
                )}
              </div>

              {selectedListing.description && (
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedListing.description}
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Admin Notes (optional)</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => handleListingAction(selectedListing.id, "approve")}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleListingAction(selectedListing.id, "reject")}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const VettingCard = ({
  submission,
  onView,
}: {
  submission: any;
  onView: () => void;
}) => {
  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[submission.status]}>
              {submission.status}
            </Badge>
            {submission.has_criminal_history && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Criminal History
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-semibold">{submission.full_name}</h3>
          <p className="text-sm text-muted-foreground">
            ID: {submission.id_number}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {submission.services.slice(0, 3).map((service: string) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {serviceCategories.find((c) => c.id === service)?.name || service}
              </Badge>
            ))}
            {submission.services.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{submission.services.length - 3} more
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Submitted {format(new Date(submission.created_at), "PPP")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
