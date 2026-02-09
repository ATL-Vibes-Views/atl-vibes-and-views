import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ============================================================
   CATEGORY PILLS — Shared filter pills across all archives
   ============================================================ */

interface CategoryPillsProps {
  categories: { name: string; slug: string }[];
  activeSlug?: string;
  onChange?: (slug: string) => void;
  allLabel?: string;
  className?: string;
}

export function CategoryPills({
  categories,
  activeSlug = "all",
  onChange,
  allLabel = "All",
  className = "",
}: CategoryPillsProps) {
  const allCategories = [{ name: allLabel, slug: "all" }, ...categories];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {allCategories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange?.(cat.slug)}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-eyebrow rounded-full border transition-colors ${
            activeSlug === cat.slug
              ? "bg-black text-white border-black"
              : "bg-white text-gray-dark border-gray-200 hover:border-black"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   STAT COUNTER — Reusable for homepage, directory, areas, about
   ============================================================ */

interface StatCounterProps {
  stats: { value: string; label: string }[];
  className?: string;
}

export function StatCounter({ stats, className = "" }: StatCounterProps) {
  return (
    <div
      className={`flex items-center justify-center gap-8 md:gap-12 ${className}`}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="font-display text-section-sm md:text-section font-semibold text-black">
            {stat.value}
          </div>
          <div className="text-eyebrow uppercase tracking-eyebrow text-gray-mid mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PAGINATION BAR — Shared across all archive / grid pages
   ============================================================ */

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  baseHref?: string; // for server-side pagination via URL
  className?: string;
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  baseHref,
  className = "",
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const PageButton = ({
    page,
    active,
  }: {
    page: number;
    active: boolean;
  }) => {
    const classes = `w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors ${
      active
        ? "bg-black text-white"
        : "text-gray-dark hover:bg-gray-light"
    }`;

    if (baseHref) {
      return (
        <Link
          href={page === 1 ? baseHref : `${baseHref}?page=${page}`}
          className={classes}
        >
          {page}
        </Link>
      );
    }

    return (
      <button
        onClick={() => onPageChange?.(page)}
        className={classes}
        disabled={active}
      >
        {page}
      </button>
    );
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {/* Prev */}
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-10 h-10 flex items-center justify-center text-gray-mid hover:text-black disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {getPageNumbers().map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-mid">
            …
          </span>
        ) : (
          <PageButton key={page} page={page} active={page === currentPage} />
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-10 h-10 flex items-center justify-center text-gray-mid hover:text-black disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ============================================================
   NEIGHBORHOOD CARD — Browse neighborhoods on overview pages
   ============================================================ */

interface NeighborhoodCardProps {
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  className?: string;
}

export function NeighborhoodCard({
  name,
  slug,
  description,
  postCount,
  className = "",
}: NeighborhoodCardProps) {
  return (
    <Link
      href={`/neighborhoods/${slug}`}
      className={`group block border border-gray-200 p-5 hover:border-gold-dark transition-colors ${className}`}
    >
      <h3 className="font-display text-card-sm font-semibold group-hover:text-red-brand transition-colors">
        {name}
      </h3>
      {description && (
        <p className="text-sm text-gray-dark mt-2 line-clamp-2">
          {description}
        </p>
      )}
      {postCount !== undefined && (
        <span className="text-meta-sm text-gray-mid mt-3 block">
          {postCount} {postCount === 1 ? "story" : "stories"}
        </span>
      )}
    </Link>
  );
}
