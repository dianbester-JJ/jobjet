import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Upload, X, Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { serviceCategories } from "@/data/services";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FieldStatus {
  valid: boolean;
  touched: boolean;
}

const VettingProcess = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [hasCriminalHistory, setHasCriminalHistory] = useState<boolean | null>(null);
  const [offenceDescription, setOffenceDescription] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hasOtherService, setHasOtherService] = useState(false);
  const [otherServiceDescription, setOtherServiceDescription] = useState("");
  const [referralOption, setReferralOption] = useState<"whatsapp" | "photos" | null>(null);
  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>(["", ""]);
  const [jobPhotos, setJobPhotos] = useState<File[]>([]);
  const [jobPhotoPreviews, setJobPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation states
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, loading, navigate]);

  const updateFieldStatus = (field: string, valid: boolean) => {
    setFieldStatuses(prev => ({
      ...prev,
      [field]: { valid, touched: true }
    }));
  };

  const validateName = (value: string) => value.trim().length >= 2;
  const validateIdNumber = (value: string) => /^\d{13}$/.test(value.replace(/\s/g, ""));
  const validateWhatsApp = (value: string) => /^(\+?27|0)[6-8][0-9]{8}$/.test(value.replace(/\s/g, ""));

  const handleIdPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      updateFieldStatus("idPhoto", true);
    }
  };

  const handleJobPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + jobPhotos.length > 5) {
      toast({
        title: "Maximum 5 photos allowed",
        variant: "destructive"
      });
      return;
    }
    
    const newPhotos = [...jobPhotos, ...files].slice(0, 5);
    setJobPhotos(newPhotos);
    
    const previews: string[] = [];
    newPhotos.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === newPhotos.length) {
          setJobPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    updateFieldStatus("jobPhotos", newPhotos.length >= 3);
  };

  const removeJobPhoto = (index: number) => {
    const newPhotos = jobPhotos.filter((_, i) => i !== index);
    const newPreviews = jobPhotoPreviews.filter((_, i) => i !== index);
    setJobPhotos(newPhotos);
    setJobPhotoPreviews(newPreviews);
    updateFieldStatus("jobPhotos", newPhotos.length >= 3);
  };

  const addWhatsAppNumber = () => {
    if (whatsappNumbers.length < 5) {
      setWhatsappNumbers([...whatsappNumbers, ""]);
    }
  };

  const removeWhatsAppNumber = (index: number) => {
    if (whatsappNumbers.length > 2) {
      const newNumbers = whatsappNumbers.filter((_, i) => i !== index);
      setWhatsappNumbers(newNumbers);
    }
  };

  const updateWhatsAppNumber = (index: number, value: string) => {
    const newNumbers = [...whatsappNumbers];
    newNumbers[index] = value;
    setWhatsappNumbers(newNumbers);
    
    const validCount = newNumbers.filter(n => validateWhatsApp(n)).length;
    updateFieldStatus("whatsapp", validCount >= 2);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const FieldIndicator = ({ field }: { field: string }) => {
    const status = fieldStatuses[field];
    if (!status?.touched) return null;
    
    return status.valid ? (
      <div className="flex items-center gap-1 text-green-600">
        <Check className="h-4 w-4" />
        <span className="text-xs">Complete</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-amber-600">
        <X className="h-4 w-4" />
        <span className="text-xs">Please check</span>
      </div>
    );
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return validateName(firstName) && validateName(lastName) && validateIdNumber(idNumber) && !!idPhoto;
      case 2:
        return hasCriminalHistory !== null && (hasCriminalHistory === false || offenceDescription.trim().length > 0);
      case 3:
        return (selectedServices.length > 0 || (hasOtherService && otherServiceDescription.trim().length > 0));
      case 4:
        if (referralOption === "whatsapp") {
          const validNumbers = whatsappNumbers.filter(n => validateWhatsApp(n));
          return validNumbers.length >= 2;
        }
        if (referralOption === "photos") {
          return jobPhotos.length >= 3;
        }
        return false;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // For now, we'll store the photo URLs as data URLs
      // In production, you'd upload to storage first
      const validWhatsappNumbers = whatsappNumbers.filter(n => validateWhatsApp(n));
      
      const { error } = await supabase.from("vetting_submissions").insert({
        user_id: user.id,
        full_name: `${firstName} ${lastName}`,
        id_number: idNumber,
        id_photo_url: idPhotoPreview,
        has_criminal_history: hasCriminalHistory || false,
        criminal_offence: hasCriminalHistory ? offenceDescription : null,
        services: selectedServices,
        other_service: hasOtherService ? otherServiceDescription : null,
        verification_method: referralOption === "whatsapp" ? "referrals" : "photos",
        referral_numbers: referralOption === "whatsapp" ? validWhatsappNumbers : null,
        job_photo_urls: referralOption === "photos" ? jobPhotoPreviews : null,
      });

      if (error) throw error;
      
      toast({
        title: "Application Submitted!",
        description: "We will review your application and get back to you within 2-3 business days.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Become a Verified Provider</h1>
          <p className="text-muted-foreground text-lg">
            Complete this form to join our trusted network of service providers
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors",
                  currentStep === step 
                    ? "bg-primary text-primary-foreground" 
                    : currentStep > step 
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
          
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                <p className="text-muted-foreground mt-1">
                  📝 Please enter your details exactly as they appear on your ID document
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="firstName" className="text-base font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <FieldIndicator field="firstName" />
                  </div>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      updateFieldStatus("firstName", validateName(e.target.value));
                    }}
                    className={cn(
                      "text-base h-12",
                      fieldStatuses.firstName?.touched && (
                        fieldStatuses.firstName.valid 
                          ? "border-green-500 focus-visible:ring-green-500" 
                          : "border-amber-500 focus-visible:ring-amber-500"
                      )
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Use your legal name as shown on your ID
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="lastName" className="text-base font-medium">
                      Surname <span className="text-destructive">*</span>
                    </Label>
                    <FieldIndicator field="lastName" />
                  </div>
                  <Input
                    id="lastName"
                    placeholder="Enter your surname"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      updateFieldStatus("lastName", validateName(e.target.value));
                    }}
                    className={cn(
                      "text-base h-12",
                      fieldStatuses.lastName?.touched && (
                        fieldStatuses.lastName.valid 
                          ? "border-green-500 focus-visible:ring-green-500" 
                          : "border-amber-500 focus-visible:ring-amber-500"
                      )
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="idNumber" className="text-base font-medium">
                    ID Number <span className="text-destructive">*</span>
                  </Label>
                  <FieldIndicator field="idNumber" />
                </div>
                <Input
                  id="idNumber"
                  placeholder="Enter your 13-digit ID number"
                  value={idNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 13);
                    setIdNumber(value);
                    updateFieldStatus("idNumber", validateIdNumber(value));
                  }}
                  className={cn(
                    "text-base h-12 font-mono tracking-wider",
                    fieldStatuses.idNumber?.touched && (
                      fieldStatuses.idNumber.valid 
                        ? "border-green-500 focus-visible:ring-green-500" 
                        : "border-amber-500 focus-visible:ring-amber-500"
                    )
                  )}
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Your ID number should be exactly 13 digits (e.g., 9001015009087)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Photo of your ID <span className="text-destructive">*</span>
                  </Label>
                  <FieldIndicator field="idPhoto" />
                </div>
                
                <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                  {idPhotoPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={idPhotoPreview} 
                        alt="ID Preview" 
                        className="max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Photo uploaded successfully!</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIdPhoto(null);
                          setIdPhotoPreview(null);
                          updateFieldStatus("idPhoto", false);
                        }}
                      >
                        Choose Different Photo
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center gap-3 py-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Tap here to upload a photo</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Take a clear photo of your ID card (front side)
                          </p>
                        </div>
                        <Button type="button" variant="outline">
                          Choose Photo
                        </Button>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleIdPhotoUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  📷 Make sure all text on your ID is clearly readable
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Criminal History */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Background Check</h2>
                <p className="text-muted-foreground mt-1">
                  This information is confidential and helps us ensure safety for all users
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">
                    Do you have any criminal history? <span className="text-destructive">*</span>
                  </Label>
                  <FieldIndicator field="criminalHistory" />
                </div>

                <RadioGroup 
                  value={hasCriminalHistory === null ? "" : hasCriminalHistory ? "yes" : "no"}
                  onValueChange={(value) => {
                    const hasHistory = value === "yes";
                    setHasCriminalHistory(hasHistory);
                    updateFieldStatus("criminalHistory", true);
                    if (!hasHistory) {
                      setOffenceDescription("");
                    }
                  }}
                  className="space-y-3"
                >
                  <label 
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      hasCriminalHistory === false 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="no" id="no" className="h-6 w-6" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">No, I do not</span>
                      <p className="text-sm text-muted-foreground">I have no criminal record</p>
                    </div>
                  </label>
                  
                  <label 
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      hasCriminalHistory === true 
                        ? "border-primary bg-primary/5" 
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="yes" id="yes" className="h-6 w-6" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">Yes, I do</span>
                      <p className="text-sm text-muted-foreground">I will provide details below</p>
                    </div>
                  </label>
                </RadioGroup>

                {hasCriminalHistory && (
                  <div className="space-y-2 mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="offence" className="text-base font-medium">
                        Please describe the offence <span className="text-destructive">*</span>
                      </Label>
                      <FieldIndicator field="offence" />
                    </div>
                    <Textarea
                      id="offence"
                      placeholder="Please provide details about the offence and when it occurred..."
                      value={offenceDescription}
                      onChange={(e) => {
                        setOffenceDescription(e.target.value);
                        updateFieldStatus("offence", e.target.value.trim().length > 10);
                      }}
                      className="min-h-[120px] text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Being honest helps us make fair decisions. Minor offences do not automatically disqualify you.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Your Services</h2>
                <p className="text-muted-foreground mt-1">
                  🛠️ Select all the services you can provide (you can choose more than one)
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {serviceCategories.map((service) => (
                  <label
                    key={service.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedServices.includes(service.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="h-6 w-6"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.icon}</span>
                      <span className="text-base font-medium">{service.name}</span>
                    </div>
                  </label>
                ))}

                <label
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all sm:col-span-2",
                    hasOtherService
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <Checkbox
                    checked={hasOtherService}
                    onCheckedChange={(checked) => setHasOtherService(checked === true)}
                    className="h-6 w-6"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">➕</span>
                    <span className="text-base font-medium">Other service not listed</span>
                  </div>
                </label>
              </div>

              {hasOtherService && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="otherService" className="text-base font-medium">
                    Describe your other service(s)
                  </Label>
                  <Textarea
                    id="otherService"
                    placeholder="E.g., HVAC installation, security system setup, appliance repair..."
                    value={otherServiceDescription}
                    onChange={(e) => setOtherServiceDescription(e.target.value)}
                    className="min-h-[100px] text-base"
                  />
                </div>
              )}

              {(selectedServices.length > 0 || (hasOtherService && otherServiceDescription)) && (
                <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    {selectedServices.length + (hasOtherService && otherServiceDescription ? 1 : 0)} service(s) selected
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: References */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Prove Your Experience</h2>
                <p className="text-muted-foreground mt-1">
                  Choose ONE option below to verify your work experience
                </p>
              </div>

              <RadioGroup 
                value={referralOption || ""}
                onValueChange={(value) => setReferralOption(value as "whatsapp" | "photos")}
                className="space-y-4"
              >
                {/* Option 1: WhatsApp Numbers */}
                <div className={cn(
                  "rounded-xl border-2 transition-all",
                  referralOption === "whatsapp" ? "border-primary" : "border-muted"
                )}>
                  <label className="flex items-start gap-4 p-4 cursor-pointer">
                    <RadioGroupItem value="whatsapp" className="mt-1 h-6 w-6" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">Option A: Client References</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Provide WhatsApp numbers of at least 2 previous clients who can vouch for your work
                      </p>
                    </div>
                  </label>

                  {referralOption === "whatsapp" && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        We will contact these clients via WhatsApp to verify your work quality
                      </div>
                      
                      {whatsappNumbers.map((number, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <div className="flex-1 space-y-1">
                            <Label className="text-sm">
                              Client {index + 1} WhatsApp {index < 2 && <span className="text-destructive">*</span>}
                            </Label>
                            <Input
                              placeholder="e.g., 0821234567"
                              value={number}
                              onChange={(e) => updateWhatsAppNumber(index, e.target.value)}
                              className={cn(
                                "h-12 text-base",
                                number && (
                                  validateWhatsApp(number)
                                    ? "border-green-500"
                                    : "border-amber-500"
                                )
                              )}
                            />
                          </div>
                          {validateWhatsApp(number) && (
                            <Check className="h-5 w-5 text-green-600 mt-6" />
                          )}
                          {index >= 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mt-6"
                              onClick={() => removeWhatsAppNumber(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {whatsappNumbers.length < 5 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addWhatsAppNumber}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Client Reference
                        </Button>
                      )}

                      <p className="text-xs text-muted-foreground">
                        💡 Use South African format: 0821234567 or +27821234567
                      </p>
                    </div>
                  )}
                </div>

                {/* Option 2: Job Photos */}
                <div className={cn(
                  "rounded-xl border-2 transition-all",
                  referralOption === "photos" ? "border-primary" : "border-muted"
                )}>
                  <label className="flex items-start gap-4 p-4 cursor-pointer">
                    <RadioGroupItem value="photos" className="mt-1 h-6 w-6" />
                    <div className="flex-1">
                      <span className="text-lg font-medium">Option B: Work Portfolio</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload at least 3 photos of your recently completed jobs
                      </p>
                    </div>
                  </label>

                  {referralOption === "photos" && (
                    <div className="px-4 pb-4 space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        📸 Show off your best work! Clear, well-lit photos work best.
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {jobPhotoPreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img 
                              src={preview} 
                              alt={`Job ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeJobPhoto(index)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        ))}
                        
                        {jobPhotos.length < 5 && (
                          <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleJobPhotoUpload}
                            />
                          </label>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {jobPhotos.length < 3 
                          ? `Please upload at least ${3 - jobPhotos.length} more photo(s)`
                          : `${jobPhotos.length} photo(s) uploaded`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="h-12 px-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!isStepValid(currentStep)}
                className="h-12 px-6"
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className="h-12 px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Need help? Contact us at <span className="font-medium">support@example.com</span></p>
        </div>
      </main>

      
    </div>
    </AppLayout>
  );
};

export default VettingProcess;
