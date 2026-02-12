import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  Sidebar,
  NewsletterWidget,
  AdPlacement,
  SubmitCTA,
  SubmitEventCTA,
} from "@/components/Sidebar";
import { getCities } from "@/lib/queries";
import type { Metadata } from "next";

/* ============================================================
   BEYOND ATL LANDING PAGE — /beyond-atl

   Simple grid of city cards linking to /beyond-atl/[slug].
   Uses areas landing page as layout reference.

   SIDEBAR:
   1. NewsletterWidget
   2. AdPlacement
   3. SubmitCTA
   4. SubmitEventCTA
   ============================================================ */

const PH_CITY = "https://placehold.co/600x400/1a1a1a/e6c46d?text=City";

export const metadata: Metadata = {
  title: "Beyond ATL — Explore Cities Outside Atlanta | ATL Vibes & Views",
  description:
    "Discover restaurants, events, stories, and culture from cities just outside Atlanta — Decatur, Marietta, Sandy Springs, and more.",
};

export default async function BeyondATLLandingPage() {
  const cities = await getCities({ excludePrimary: true });

  return (
    <>
      {/* ========== 1. HERO ========== */}
      <section className="relative w-full">
        <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[65vh] overflow-hidden">
          <Image
            src="https://placehold.co/1920x600/1a1a1a/e6c46d?text=Beyond+ATL"
            alt="Beyond ATL"
            fill
            unoptimized
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20">
          <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
            Beyond ATL
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white max-w-4xl leading-tight">
            Explore Beyond Atlanta
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-4 max-w-xl">
            From Decatur to Marietta, discover the vibrant cities
            and communities just outside Atlanta.
          </p>
        </div>
      </section>

      {/* ========== MAIN + SIDEBAR GRID ========== */}
      <div className="site-container pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16">
          {/* ---------- MAIN COLUMN ---------- */}
          <div className="space-y-28">
            {/* ===== CITY CARDS GRID ===== */}
            <section>
              {cities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cities.map((city) => (
                    <Link
                      key={city.id}
                      href={`/beyond-atl/${city.slug}`}
                      className="group block relative overflow-hidden aspect-[4/3]"
                    >
                      {city.hero_image_url ? (
                        <Image
                          src={city.hero_image_url}
                          alt={city.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Image
                          src={PH_CITY}
                          alt={city.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-display text-xl md:text-2xl font-semibold text-white group-hover:text-[#fee198] transition-colors">
                          {city.name}
                        </h3>
                        {city.tagline && (
                          <p className="text-white/60 text-xs mt-1 line-clamp-2">
                            {city.tagline}
                          </p>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={18} className="text-white" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-mid text-sm text-center py-12">
                  City listings coming soon.
                </p>
              )}
            </section>

            {/* ===== NEWSLETTER CTA ===== */}
            <section className="bg-[#f8f5f0] py-16 px-8 md:px-16 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-2 italic">
                Join The A-List Newsletter
              </h2>
              <p className="text-gray-mid text-sm mb-8">
                Get the latest on Atlanta&rsquo;s culture, neighborhoods, and events.
              </p>
              <NewsletterForm />
              <p className="text-gray-mid/60 text-xs mt-4">No spam. Unsubscribe anytime.</p>
            </section>
          </div>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="hidden lg:block">
            <Sidebar>
              <NewsletterWidget />
              <AdPlacement slot="sidebar_top" />
              <SubmitCTA />
              <SubmitEventCTA />
            </Sidebar>
          </aside>
        </div>
      </div>
    </>
  );
}
