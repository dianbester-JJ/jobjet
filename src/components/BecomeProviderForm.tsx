import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { serviceCategories } from "@/data/services";
import { Loader2 } from "lucide-react";

interface BecomeProviderFormProps {
  onComplete?: () => void;
}

const BecomeProviderForm = ({ onComplete }: BecomeProviderFormProps) => {
  const { addProRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !serviceArea.trim() || !bio.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await addProRole();
      toast({ title: "Welcome to JobJet Pro!", description: "You can now create listings and receive job requests." });
      onComplete?.();
      navigate("/provider/dashboard");
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Service Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select your trade" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Service Area</label>
        <Input
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          placeholder="e.g. Johannesburg, Cape Town"
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Brief Bio</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell customers about your experience and skills..."
          className="mt-1"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Become a Provider
      </Button>
    </form>
  );
};

export default BecomeProviderForm;
