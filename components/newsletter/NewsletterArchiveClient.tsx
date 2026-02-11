"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { Search, X, Mail, ArrowRight } from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

interface ClientNewsletter {
  id: string;
  name: string;
  slug: string;
  issue_date: string;
  subject_line: string | null;
  preview_text: string | null;
  type_slug: string;
}

interface TypeTab {
  slug: string;
  name: string;
  count: number;
}

interface NewsletterArchiveClientProps {
  newsletters: ClientNewsletter[];
  typeTabs: TypeTab[];
  currentFilters: {
    type?: string;
    search?: string;
    page?: string;
  };
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const PER_PAGE = 12;

const TYPE_COLORS: Record<string, string> = {
  "weekly-roundup": "#e6c46d",
  "neighborhood-spotlight": "#c1121f",
  "business-features": "#2d6a4f",
  "events-guide": "#7b2cbf",
  "city-watch": "#1a1a1a",
  "special-edition": "#b89a5a",
};

function getAccentColor(slug: string): string {
  return TYPE_COLORS[slug] ?? "#999";
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ============================================================
   COMPONENT
   ============================================================ */

export function NewsletterArchiveClient({
  newsletters,
  typeTabs,
  currentFilters,
}: NewsletterArchiveClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentFilters.search ?? "");

  const currentPage = parseInt(currentFilters.page ?? "1", 10);
  const activeType = currentFilters.type ?? "";

  /* ── Filter newsletters client-side ── */
  let filtered = newsletters;

  if (activeType) {
    filtered = filtered.filter((nl) => nl.type_slug === activeType);
  }

  if (currentFilters.search) {
    const term = currentFilters.search.toLowerCase();
    filtered = filtered.filter(
      (nl) =>
        nl.subject_line?.toLowerCase().includes(term) ||
        nl.preview_text?.toLowerCase().includes(term) ||
        nl.name.toLowerCase().includes(term)
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + PER_PAGE);

  /* ── URL param helpers ── */
  const pushFilters = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, val] of Object.entries(overrides)) {
        if (val && val.trim()) {
          params.set(key, val.trim());
        } else {
          params.delete(key);
        }
      }

      // Reset page when filters change (unless page is being explicitly set)
      if (!("page" in overrides)) {
        params.delete("page");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const switchType = useCallback(
    (typeSlug: string) => {
      setSearchValue("");
      const params = new URLSearchParams();
      if (typeSlug) params.set("type", typeSlug);
      startTransition(() => {
        router.push(
          `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
          { scroll: false }
        );
      });
    },
    [pathname, router]
  );

  const goToPage = useCallback(
    (page: number) => {
      pushFilters({ page: page > 1 ? String(page) : undefined });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pushFilters]
  );

  return (
    <div>
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-black">
          All Editions
        </h2>
        {isPending && (
          <div className="w-4 h-4 border-2 border-[#e6c46d] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* ── Type filter tabs ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => switchType("")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            !activeType
              ? "bg-[#1a1a1a] text-white"
              : "bg-gray-100 text-gray-dark hover:bg-gray-200"
          }`}
        >
          All ({newsletters.length})
        </button>
        {typeTabs.map((tab) => (
          <button
            key={tab.slug}
            onClick={() => switchType(tab.slug)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeType === tab.slug
                ? "bg-[#1a1a1a] text-white"
                : "bg-gray-100 text-gray-dark hover:bg-gray-200"
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="relative w-full max-w-md mb-8">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid pointer-events-none"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushFilters({ search: searchValue });
          }}
          placeholder="Search newsletters..."
          className="w-full pl-11 pr-10 py-3 text-sm bg-white border-2 border-[#e6c46d] outline-none focus:border-[#d4a94e] focus:shadow-[0_0_0_3px_rgba(230,196,109,0.2)] transition-all placeholder:text-gray-mid"
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue("");
              pushFilters({ search: undefined });
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-black"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      <div className="mb-6">
        <span className="text-xs text-gray-mid">
          {filtered.length} newsletter{filtered.length !== 1 ? "s" : ""}
          {activeType
            ? ` in ${typeTabs.find((t) => t.slug === activeType)?.name ?? activeType}`
            : ""}
          {currentFilters.search ? ` matching "${currentFilters.search}"` : ""}
        </span>
      </div>

      {/* ── Newsletter grid ── */}
      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {pageItems.map((nl) => {
            const accent = getAccentColor(nl.type_slug);
            return (
              <Link
                key={nl.id}
                href={`/newsletters/${nl.slug}`}
                className="group block border border-gray-200 p-6 hover:border-[#e6c46d] transition-colors"
              >
                {/* Type eyebrow */}
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={12} style={{ color: accent }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-eyebrow"
                    style={{ color: accent }}
                  >
                    {nl.name}
                  </span>
                </div>

                {/* Subject line */}
                <h3 className="font-display text-lg font-semibold text-black leading-snug group-hover:text-[#c1121f] transition-colors line-clamp-2">
                  {nl.subject_line || nl.name}
                </h3>

                {/* Date */}
                <p className="text-xs text-gray-mid mt-2">
                  {formatDate(nl.issue_date)}
                </p>

                {/* Preview text */}
                {nl.preview_text && (
                  <p className="text-sm text-gray-mid line-clamp-2 mt-2">
                    {nl.preview_text}
                  </p>
                )}

                {/* Arrow */}
                <div className="flex justify-end mt-3">
                  <ArrowRight
                    size={14}
                    className="text-gray-400 group-hover:text-[#c1121f] transition-colors"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Mail size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-mid text-lg mb-4">No newsletters found.</p>
          {(activeType || currentFilters.search) && (
            <button
              onClick={() => switchType("")}
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-black text-black text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
          {/* Prev */}
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className="px-4 py-2 text-sm font-medium border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-10 h-10 text-sm font-medium transition-colors ${
                p === safePage
                  ? "bg-[#1a1a1a] text-white"
                  : "border border-gray-200 text-gray-dark hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          {/* Next */}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className="px-4 py-2 text-sm font-medium border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
