import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { NewsletterArchiveClient } from "@/components/newsletter/NewsletterArchiveClient";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  NeighborhoodsWidget,
  SubmitCTA,
} from "@/components/Sidebar";
import {
  getNewsletters,
  getNewsletterTypes,
  getNeighborhoodsByPopularity,
} from "@/lib/queries";
import type { Newsletter, NewsletterType } from "@/lib/queries";

/* ============================================================
   NEWSLETTER ARCHIVE — /newsletters
   Full archive with type filtering, search, pagination + sidebar
   ============================================================ */

export const metadata: Metadata = {
  title: "Newsletter Archive — ATL Vibes & Views",
  description:
    "Browse every edition of the ATL Vibes & Views newsletters. Atlanta news, neighborhood guides, dining spotlights, and community stories delivered weekly.",
  openGraph: {
    title: "Newsletter Archive | ATL Vibes & Views",
    description:
      "Browse every edition of the ATL Vibes & Views newsletters.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/newsletters",
  },
};

/* --- Type color mapping --- */
const TYPE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  "weekly-roundup": { bg: "bg-[#fee198]/30", text: "text-[#8a6914]", accent: "#e6c46d" },
  "neighborhood-spotlight": { bg: "bg-[#c1121f]/10", text: "text-[#c1121f]", accent: "#c1121f" },
  "business-features": { bg: "bg-[#2d6a4f]/10", text: "text-[#2d6a4f]", accent: "#2d6a4f" },
  "events-guide": { bg: "bg-[#7b2cbf]/10", text: "text-[#7b2cbf]", accent: "#7b2cbf" },
  "city-watch": { bg: "bg-[#1a1a1a]/10", text: "text-[#1a1a1a]", accent: "#1a1a1a" },
  "special-edition": { bg: "bg-[#b89a5a]/15", text: "text-[#8a6914]", accent: "#b89a5a" },
};

function getTypeColor(slug: string) {
  return TYPE_COLORS[slug] ?? { bg: "bg-gray-100", text: "text-gray-dark", accent: "#999" };
}

/* --- Helpers --- */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PH_HERO = "https://placehold.co/1920x400/1a1a1a/e6c46d?text=Newsletters";

/* --- Page Component --- */

export default async function NewslettersPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const filters = await searchParams;

  /* ── Fetch data ── */
  const [allNewsletters, newsletterTypes, popularNeighborhoods] =
    await Promise.all([
      getNewsletters(),
      getNewsletterTypes(),
      getNeighborhoodsByPopularity({ limit: 6 }),
    ]);

  /* ── Distinct type names from newsletters for filtering ── */
  const distinctTypes = new Map<string, string>();
  allNewsletters.forEach((nl) => {
    if (nl.name) {
      const slug = nl.name.toLowerCase().replace(/\s+/g, "-");
      distinctTypes.set(slug, nl.name);
    }
  });

  /* ── Build type tabs from newsletter_types + fallback to distinct names ── */
  const typeTabs: { slug: string; name: string; count: number }[] = [];
  if (newsletterTypes.length > 0) {
    for (const nt of newsletterTypes) {
      const count = allNewsletters.filter((nl) => nl.name === nt.name).length;
      typeTabs.push({ slug: nt.slug, name: nt.name, count });
    }
  } else {
    for (const [slug, name] of distinctTypes) {
      const count = allNewsletters.filter((nl) => nl.name === name).length;
      typeTabs.push({ slug, name, count });
    }
  }

  /* ── Map newsletters to client-friendly format ── */
  const clientNewsletters = allNewsletters.map((nl) => ({
    id: nl.id,
    name: nl.name,
    slug: nl.issue_slug,
    issue_date: nl.issue_date,
    subject_line: nl.subject_line,
    preview_text: nl.preview_text,
    type_slug: nl.name.toLowerCase().replace(/\s+/g, "-"),
  }));

  /* ── JSON-LD ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Newsletter Archive",
    description:
      "Browse every edition of the ATL Vibes & Views newsletters.",
    url: "https://atlvibesandviews.com/newsletters",
    publisher: {
      "@type": "Organization",
      name: "ATL Vibes & Views",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========== DARK HERO ========== */}
      <section className="relative w-full h-[180px] md:h-[220px] overflow-hidden">
        <Image
          src={PH_HERO}
          alt="Newsletter Archive"
          fill
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="site-container pb-8 md:pb-10">
            <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 block">
              Newsletters
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-[1.05]">
              Newsletter Archive
            </h1>
            <p className="text-white/60 text-sm mt-2 max-w-lg">
              Every edition of our Atlanta newsletters — news, guides, spotlights, and more.
            </p>
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER TYPE CARDS ========== */}
      {typeTabs.length > 0 && (
        <section className="site-container py-10 md:py-14">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-black mb-8">
            Our Newsletters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {typeTabs.map((tab) => {
              const colors = getTypeColor(tab.slug);
              const typeInfo = newsletterTypes.find((nt) => nt.slug === tab.slug);
              return (
                <Link
                  key={tab.slug}
                  href={`/newsletters?type=${tab.slug}`}
                  className={`group block p-6 border border-gray-200 hover:border-gray-300 transition-colors ${colors.bg}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: colors.accent + "20" }}
                    >
                      <Mail size={18} style={{ color: colors.accent }} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-black group-hover:text-[#c1121f] transition-colors">
                        {tab.name}
                      </h3>
                      {typeInfo?.frequency && (
                        <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-gray-mid">
                          {typeInfo.frequency}
                          {typeInfo.send_day ? ` · ${typeInfo.send_day}s` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  {typeInfo?.description && (
                    <p className="text-sm text-gray-dark line-clamp-2 mb-3">
                      {typeInfo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-mid">
                      {tab.count} edition{tab.count !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-gray-400 group-hover:text-[#c1121f] transition-colors"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ========== MAIN CONTENT — SIDEBAR + ARCHIVE ========== */}
      <div className="site-container pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* --- Archive Column --- */}
          <div className="min-w-0">
            <Suspense
              fallback={
                <div className="py-12 text-center text-gray-mid">
                  Loading newsletters...
                </div>
              }
            >
              <NewsletterArchiveClient
                newsletters={clientNewsletters}
                typeTabs={typeTabs}
                currentFilters={{
                  type: filters.type,
                  search: filters.search,
                  page: filters.page,
                }}
              />
            </Suspense>
          </div>

          {/* --- Sidebar --- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget
                title="Get the Newsletter"
                description="Atlanta news, guides, and culture delivered to your inbox every week."
              />
              <AdPlacement slot="sidebar_top" />
              <NeighborhoodsWidget
                title="Popular Neighborhoods"
                neighborhoods={popularNeighborhoods.map((n) => ({
                  name: n.name,
                  slug: n.slug,
                }))}
              />
              <SubmitCTA
                heading="Own a Business?"
                description="Get your business in front of thousands of Atlantans."
                buttonText="Get Listed"
                href="/submit"
              />
            </Sidebar>
          </aside>
        </div>
      </div>

      {/* ========== SUBSCRIBE CTA ========== */}
      <NewsletterBlock
        heading="Atlanta in Your Inbox"
        description="Get the latest on Atlanta's neighborhoods, events, and culture delivered to your inbox. No spam. Unsubscribe anytime."
      />

      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://atlvibesandviews.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Newsletter Archive",
              },
            ],
          }),
        }}
      />
    </>
  );
}
