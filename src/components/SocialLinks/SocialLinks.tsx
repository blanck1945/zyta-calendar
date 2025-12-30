// src/components/SocialLinks/SocialLinks.tsx
import { 
  Instagram, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  Link as LinkIcon
} from "lucide-react";
import type { CalendarLink } from "../../hooks/useCalendarSchedule";

interface SocialLinksProps {
  links: CalendarLink[];
}

// Función para detectar el tipo de red social basado en la URL
function getSocialType(url: string, name: string): {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
} {
  const lowerUrl = url.toLowerCase();
  const lowerName = name.toLowerCase();

  // Instagram
  if (lowerUrl.includes("instagram.com") || lowerName.includes("instagram")) {
    return {
      icon: Instagram,
      color: "text-[#E4405F]",
    };
  }

  // WhatsApp
  if (lowerUrl.includes("wa.me") || lowerUrl.includes("whatsapp.com") || lowerName.includes("whatsapp")) {
    return {
      icon: MessageCircle,
      color: "text-[#25D366]",
    };
  }

  // Facebook
  if (lowerUrl.includes("facebook.com") || lowerName.includes("facebook")) {
    return {
      icon: Facebook,
      color: "text-[#1877F2]",
    };
  }

  // Twitter/X
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com") || lowerName.includes("twitter") || lowerName.includes("x.com")) {
    return {
      icon: Twitter,
      color: "text-[#1DA1F2]",
    };
  }

  // LinkedIn
  if (lowerUrl.includes("linkedin.com") || lowerName.includes("linkedin")) {
    return {
      icon: Linkedin,
      color: "text-[#0A66C2]",
    };
  }

  // YouTube
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerName.includes("youtube")) {
    return {
      icon: Youtube,
      color: "text-[#FF0000]",
    };
  }

  // Default - Link genérico
  return {
    icon: LinkIcon,
    color: "text-muted-foreground",
  };
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link, index) => {
        const { icon: Icon, color } = getSocialType(link.value, link.name);
        
        return (
          <a
            key={index}
            href={link.value}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg
              transition-all duration-200
              hover:bg-primary/10 hover:scale-110
              border border-border
              ${color}
            `}
            title={link.name}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;

