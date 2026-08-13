import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Linkedin, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
  excerpt?: string;
  variant?: "horizontal" | "vertical";
  showLabel?: boolean;
}

export function ShareButtons({
  title,
  url,
  excerpt,
  variant = "horizontal",
  showLabel = true,
}: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = excerpt ? encodeURIComponent(excerpt) : "";

  const handleWhatsApp = () => {
    const text = `${title}\n\n${excerpt || ""}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "width=600,height=600");
  };

  const handleLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedinUrl, "_blank", "width=600,height=600");
  };

  const handleTwitter = () => {
    const twitterText = `${title} - Confira no blog Todo Motor: ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodedUrl}`;
    window.open(twitterUrl, "_blank", "width=600,height=600");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const containerClass = variant === "vertical" ? "flex flex-col gap-2" : "flex gap-2 flex-wrap";
  const buttonSize = showLabel ? "default" : "sm";
  const buttonVariant = "outline";

  return (
    <div className={containerClass}>
      <Button
        onClick={handleWhatsApp}
        variant={buttonVariant}
        size={buttonSize}
        className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500"
        title="Compartilhar no WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        {showLabel && <span className="ml-2">WhatsApp</span>}
      </Button>

      <Button
        onClick={handleLinkedIn}
        variant={buttonVariant}
        size={buttonSize}
        className="hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600"
        title="Compartilhar no LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        {showLabel && <span className="ml-2">LinkedIn</span>}
      </Button>

      <Button
        onClick={handleTwitter}
        variant={buttonVariant}
        size={buttonSize}
        className="hover:bg-black/10 hover:text-black hover:border-black dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white"
        title="Compartilhar no Twitter"
      >
        <Twitter className="h-4 w-4" />
        {showLabel && <span className="ml-2">Twitter</span>}
      </Button>

      <Button
        onClick={handleCopyLink}
        variant={buttonVariant}
        size={buttonSize}
        className="hover:bg-accent/10 hover:text-accent hover:border-accent"
        title="Copiar link"
      >
        <Share2 className="h-4 w-4" />
        {showLabel && <span className="ml-2">Copiar Link</span>}
      </Button>
    </div>
  );
}
