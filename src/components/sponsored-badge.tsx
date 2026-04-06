import { Info } from "lucide-react";

interface SponsoredBadgeProps {
  className?: string;
}

export function SponsoredBadge({ className = "" }: SponsoredBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-accent text-text-main text-xs font-sarabun font-semibold px-3 py-1 rounded-full ${className}`}
    >
      <Info className="w-3.5 h-3.5" aria-hidden="true" />
      เนื้อหาสนับสนุน
    </span>
  );
}
