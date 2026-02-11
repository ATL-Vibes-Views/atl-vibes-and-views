import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/* ============================================================
   NEWSLETTER CARD — Shared card component for archive zones

   Features:
   - 4px color-coded left border
   - Featured image (16:10, hover zoom)
   - Type label (color-coded eyebrow)
   - Subject line (2-line clamp)
   - Preview text (2-line clamp)
   - Date + animated arrow
   - Links to /newsletters/[slug]
   ============================================================ */

const PH_NL = "https://placehold.co/600x375/1a1a1a/666?text=Newsletter";

export interface NewsletterCardData {
  id: string;
  slug: string;
  name: string;
  issue_date: string;
  subject_line: string | null;
  preview_text: string | null;
  featured_image_url: string | null;
  type_slug: string;
  border_color: string;
  label_color: string;
  label: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function NewsletterCard({ card }: { card: NewsletterCardData }) {
  return (
    <Link
      href={`/newsletters/${card.slug}`}
      className="group block border border-gray-200 hover:shadow-md transition-all overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: card.border_color }}
    >
      {/* Featured image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1a]">
        {card.featured_image_url ? (
          <Image
            src={card.featured_image_url}
            alt={card.subject_line || card.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display italic text-2xl text-white/10">
              Newsletter
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Type label */}
        <span
          className="text-[10px] font-semibold uppercase tracking-eyebrow block mb-1.5"
          style={{ color: card.label_color }}
        >
          {card.label}
        </span>

        {/* Subject line */}
        <h3 className="font-display text-[18px] font-bold text-black leading-snug group-hover:text-[#c1121f] transition-colors line-clamp-2">
          {card.subject_line || card.name}
        </h3>

        {/* Preview text */}
        {card.preview_text && (
          <p className="text-[13px] text-gray-mid line-clamp-2 mt-1.5">
            {card.preview_text}
          </p>
        )}

        {/* Date + Arrow */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-mid">
            {formatDate(card.issue_date)}
          </span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-[#c1121f] group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </Link>
  );
}
