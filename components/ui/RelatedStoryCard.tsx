import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { PH_DEFAULT } from "@/lib/placeholders";

const PH_POST = PH_DEFAULT;

export interface RelatedPost {
  slug: string;
  title: string;
  featured_image_url: string | null;
  category_name: string | null;
  published_at: string | null;
  neighborhood_name?: string | null;
  neighborhood_slug?: string | null;
  excerpt?: string | null;
  is_featured?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RelatedStoryCard({ post }: { post: RelatedPost }) {
  return (
    <Link href={`/stories/${post.slug}`} className="group block">
      {/* Image area */}
      <div className="relative aspect-[16/10] overflow-hidden mb-3 bg-gray-100">
        <Image
          src={post.featured_image_url || PH_POST}
          alt={post.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Desktop-only excerpt overlay on image hover */}
        {post.excerpt && (
          <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center px-6">
            <p className="text-white text-sm line-clamp-3 text-center">{post.excerpt}</p>
          </div>
        )}
      </div>

      {/* Featured badge */}
      {post.is_featured && (
        <span className="bg-[#fee198] text-[#1a1a1a] text-[9px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 inline-block mb-1">
          Featured
        </span>
      )}

      {/* Category eyebrow */}
      {post.category_name && (
        <span className={`text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow block ${post.is_featured ? "" : "mt-3"}`}>
          {post.category_name}
        </span>
      )}

      {/* Title */}
      <h3 className="font-display text-lg font-semibold text-black leading-snug mt-1 group-hover:text-[#c1121f] transition-colors line-clamp-2">
        {post.title}
      </h3>

      {/* Neighborhood link — clean text, no pill */}
      {post.neighborhood_name && post.neighborhood_slug && (
        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/neighborhoods/${post.neighborhood_slug}`}
            className="inline-flex items-center gap-1 text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow hover:text-[#b89a5a] transition-colors"
          >
            <MapPin size={10} />
            {post.neighborhood_name}
          </Link>
        </div>
      )}

      {/* Date + Arrow row */}
      <div className="flex items-center justify-between mt-2">
        {post.published_at && (
          <span className="text-xs text-gray-mid">{formatDate(post.published_at)}</span>
        )}
        <ArrowRight size={14} className="text-gray-400" />
      </div>

      {/* Mobile excerpt */}
      {post.excerpt && (
        <p className="lg:hidden text-sm text-gray-mid line-clamp-2 mt-1">{post.excerpt}</p>
      )}
    </Link>
  );
}
