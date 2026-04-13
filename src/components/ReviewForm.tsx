import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, ImagePlus, X } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  providerId: string;
  customerId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ bookingId, providerId, customerId, onReviewSubmitted }: ReviewFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (validFiles.length + images.length > 5) {
      toast({ title: "Too many images", description: "Maximum 5 images per review", variant: "destructive" });
      return;
    }
    const newImages = [...images, ...validFiles];
    setImages(newImages);
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Rating required", description: "Please select a star rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    let imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop();
      const path = `${customerId}/${bookingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(path, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
    }

    const { error } = await (supabase as any).from("reviews").insert({
      booking_id: bookingId,
      provider_id: providerId,
      customer_id: customerId,
      rating,
      comment: comment.trim() || null,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
    });

    if (error) {
      toast({ title: "Error", description: "Could not submit review. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      onReviewSubmitted();
    }
    setSubmitting(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground">Write a Review</h3>
      <p className="mt-1 text-sm text-muted-foreground">Share your experience with this Pro</p>

      {/* Star Rating */}
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 ${
                star <= (hoverRating || rating)
                  ? "fill-primary text-primary"
                  : "text-muted"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Great" : "Excellent"}
          </span>
        )}
      </div>

      {/* Comment */}
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell others about your experience..."
        className="mt-4"
        rows={3}
      />

      {/* Image Upload */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-0.5 top-0.5 rounded-full bg-foreground/70 p-0.5 text-background"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Up to 5 images, max 5MB each</p>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};

export default ReviewForm;
