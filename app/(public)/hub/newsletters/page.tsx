import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { NewsletterBlock } from "@/components/ui/NewsletterBlock";
import { getNewsletters } from "@/lib/queries";
import { PH_DEFAULT } from "@/lib/placeholders";

/* ============================================================
   NEWSLETTER ARCHIVE — /hub/newsletters
   Past editions of the ATL Vibes & Views newsletter
   ============================================================ */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter Archive — ATL Vibes & Views",
  description:
    "Catch up on past editions of the ATL Vibes & Views newsletter. Atlanta news, guides, and culture in your inbox.",
  openGraph: {
    title: "Newsletter Archive | ATL Vibes & Views",
    description:
      "Catch up on past editions of the ATL Vibes & Views newsletter.",
    type: "website",
  },
  alternates: {
    canonical: "https://atlvibesandviews.com/hub/newsletters",
  },
};

/* --- Helpers --- */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PH_HERO = PH_DEFAULT;

export default async function NewslettersPage() {
  const newsletters = await getNewsletters();

  /* ── JSON-LD ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Newsletter Archive",
    description:
      "Past editions of the ATL Vibes & Views newsletter.",
    url: "https://atlvibesandviews.com/hub/newsletters",
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
      <section className="relative w-full h-[150px] md:h-[180px] overflow-hidden">
        <Image
          src={PH_HERO}
          alt="Newsletter Archive"
          fill
          unoptimized
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="site-container pb-8 md:pb-10">
            <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 block">
              Newsletters
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-white leading-[1.05]">
              Newsletter Archive
            </h1>
            <p className="text-white/60 text-sm mt-2 max-w-lg">
              Catch up on past editions of our Atlanta newsletter.
            </p>
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER GRID ========== */}
      <section className="site-container py-12 md:py-16">
        {newsletters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {newsletters.map((nl) => (
              <Link
                key={nl.id}
                href={`/hub/newsletters/${nl.issue_slug}`}
                className="group block border border-gray-200 p-6 hover:border-[#e6c46d] transition-colors"
              >
                {/* Newsletter name eyebrow */}
                {nl.name && (
                  <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-eyebrow">
                    {nl.name}
                  </span>
                )}

                {/* Subject line */}
                <h3 className="font-display text-lg font-semibold text-black leading-snug mt-1 group-hover:text-[#c1121f] transition-colors line-clamp-2">
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
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <p className="text-gray-mid text-lg mb-4">No newsletters yet.</p>
            <p className="text-gray-mid text-sm">
              Subscribe below to be the first to know when we publish.
            </p>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
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
                name: "The Hub",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Newsletter Archive",
              },
            ],
          }),
        }}
      />
    </>
  );
}
