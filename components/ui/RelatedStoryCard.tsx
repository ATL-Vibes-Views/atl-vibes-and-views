import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

const PH_POST = "https://placehold.co/600x400/1a1a1a/e6c46d?text=Story";

export interface RelatedPost {
  slug: string;
  title: string;
  featured_image_url: string | null;
  category_name: string | null;
  published_at: string | null;
  neighborhood_name?: string | null;
  neighborhood_slug?: string | null;
  excerpt?: string | null;
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
      <div className="relative aspect-[16/10] overflow-hidden mb-3 bg-gray-100">
        <Image
          src={post.featured_image_url || PH_POST}
          alt={post.title}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      {post.category_name && (
        <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow">
          {post.category_name}
        </span>
      )}
      <h3 className="font-display text-lg font-semibold text-black leading-snug mt-1 group-hover:text-[#c1121f] transition-colors line-clamp-2">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-gray-dark text-sm mt-1.5 line-clamp-2">
          {post.excerpt}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        {post.published_at && (
          <p className="text-gray-mid text-xs">
            {formatDate(post.published_at)}
          </p>
        )}
        {post.neighborhood_name && post.neighborhood_slug && (
          <span
            onClick={(e) => e.stopPropagation()}
            className="inline-block"
          >
            <Link
              href={`/neighborhoods/${post.neighborhood_slug}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-[10px] text-gray-dark font-medium hover:bg-[#fee198] hover:text-black transition-colors"
            >
              <MapPin size={10} />
              {post.neighborhood_name}
            </Link>
          </span>
        )}
      </div>
    </Link>
  );
}
