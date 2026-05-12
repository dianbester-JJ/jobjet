import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  url?: string;
  title?: string;
  text?: string;
  label?: string;
}

const ShareButton = ({
  url,
  title,
  text,
  label = "Share",
  variant = "outline",
  size,
  className,
  ...rest
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = url || window.location.href;
    const shareData: ShareData = {
      title: title || document.title,
      text: text || title || "",
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!", description: "Share it anywhere you like." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleShare} {...rest}>
      {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
      {copied ? "Copied!" : label}
    </Button>
  );
};

export default ShareButton;
