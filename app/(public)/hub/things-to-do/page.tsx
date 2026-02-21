import type { Metadata } from "next";
import { PH_DEFAULT, PH_MAP } from "@/lib/placeholders";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { HeroSection } from "@/components/ui/HeroSection";
import { AdBlock } from "@/components/ui/AdBlock";
import {
  getAreas,
  getNeighborhoods,
  getNeighborhoodIdsForArea,
  getNeighborhoodsByPopularity,
  getHubFilterData,
  getHubBusinesses,
} from "@/lib/queries";
import {
  SubmitCTA,
  SidebarWidget,
  WidgetTitle,
  NeighborhoodsWidget,
} from "@/components/Sidebar";
import { HubArchiveClient } from "@/components/HubArchiveClient";
import type { HubArchiveConfig } from "@/components/HubArchiveClient";
import { getPageHero, getHeroPost } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Things To Do in Atlanta",
  description:
    "Museums, parks, landmarks, markets, and local favorites — discover the best of what Atlanta has to offer.",
  openGraph: {
    title: "Things To Do in Atlanta | ATL Vibes & Views",
    description:
      "Museums, parks, landmarks, markets, and local favorites — discover the best of what Atlanta has to offer.",
    url: "https://atlvibesandviews.com/hub/things-to-do",
  },
};

const HUB_CONFIG: HubArchiveConfig = {
  detailBasePath: "/places",
  searchPlaceholder: "Search activities by name, address, or description…",
  featuredTitle: "Featured Experiences",
  featuredCountNoun: ["listing", "listings"],
  ctaTitle: "Get Your Experience Featured",
  ctaDescription:
    "Reach thousands of Atlantans with Premium placement in our things-to-do guide.",
  mapToggleLabel: "Activity Map",
  mapImage: PH_MAP,
  mapAlt: "Atlanta Activity Map — placeholder",
  gridEyebrow: "Things To Do",
  gridCountNoun: ["listing", "listings"],
  loadMoreLabel: "Load More Activities",
  emptyNoun: "listings",
  submitNoun: "activity",
  newsletterDescription:
    "Get weekly activity picks, local gems, and community updates delivered to your inbox.",
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const PH_HERO = PH_DEFAULT;

  const _hero = await getPageHero("hub_things").catch(() => ({ type: null, imageUrl: null, videoUrl: null, postId: null, alt: null }));
  const _heroPost = (_hero.type === "post" || _hero.type === "featured_post") ? await getHeroPost(_hero.postId).catch(() => null) : null;

/* ============================================================
   THINGS TO DO HUB — /hub/things-to-do
   ============================================================ */
export default async function ThingsToDoHubPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    area?: string;
    neighborhood?: string;
    category?: string;
    tier?: string;
    tag?: string;
    amenity?: string;
    identity?: string;
  }>;
}) {
  const sp = await searchParams;

  /* ---------- Static filter data ---------- */
  const [areas, allNeighborhoods, filterData] = await Promise.all([
    getAreas(),
    getNeighborhoods(),
    getHubFilterData({ categoryMode: { type: "appliesTo", value: "things_to_do" } }),
  ]);

  /* Collect category IDs for hard-filtering all business_listings queries */
  const ttdCategIds = filterData.categories.map((c) => c.id);

  /* ---------- Resolve area → neighborhood IDs ---------- */
  let neighborhoodIds: string[] | undefined;
  if (sp.neighborhood) {
    const nh = allNeighborhoods.find((n) => n.slug === sp.neighborhood);
    if (nh) neighborhoodIds = [nh.id];
  } else if (sp.area) {
    const area = areas.find((a) => a.slug === sp.area);
    if (area) {
      neighborhoodIds = await getNeighborhoodIdsForArea(area.id);
    }
  }

  /* ---------- Businesses (featured, grid, map) ---------- */
  const businessData = await getHubBusinesses({
    categoryIds: ttdCategIds,
    filters: {
      q: sp.q,
      category: sp.category,
      tier: sp.tier,
      tag: sp.tag,
      amenity: sp.amenity,
      identity: sp.identity,
    },
    neighborhoodIds,
    categories: filterData.categories,
  });

  /* ---------- Sidebar neighborhoods ---------- */
  const topNeighborhoods = await getNeighborhoodsByPopularity({ limit: 8 });

  /* ---------- Current filters for client ---------- */
  const currentFilters = {
    q: sp.q,
    area: sp.area,
    neighborhood: sp.neighborhood,
    category: sp.category,
    tier: sp.tier,
    tag: sp.tag,
    amenity: sp.amenity,
    identity: sp.identity,
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>

      {/* ========== 1. HERO ========== */}
      <HeroSection
        heroType={(_hero.type ?? "image") as "image" | "video" | "post" | "featured_post"}
        backgroundImage={_hero.imageUrl ?? PH_HERO}
        videoUrl={_hero.videoUrl ?? undefined}
        heroPost={_heroPost}
        eyebrow="The Hub"
        title="Things To Do in Atlanta"
        description="Museums, parks, landmarks, markets, and local favorites — discover the best of what Atlanta has to offer."
      />

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "The Hub", href: "/hub" },
            { label: "Things To Do" },
          ]}
        />
      </div>

      {/* ========== CLIENT COMPONENT ========== */}
      <HubArchiveClient
        config={HUB_CONFIG}
        areas={areas.map((a) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
        }))}
        neighborhoods={allNeighborhoods.map((n) => ({
          id: n.id,
          name: n.name,
          slug: n.slug,
          area_id: n.area_id,
        }))}
        categories={filterData.categories}
        tags={filterData.tags}
        amenities={filterData.amenities}
        identityOptions={filterData.identityOptions}
        featuredBusinesses={businessData.featured}
        mapBusinesses={businessData.map}
        gridBusinesses={businessData.grid}
        totalGridCount={businessData.gridCount}
        currentFilters={currentFilters}
      >
        {/* Sidebar (server-rendered, passed via children) */}
        <aside>
          <div className="lg:sticky lg:top-6">
            {/* Submit CTA */}
            <SubmitCTA />

            {/* Top Neighborhoods */}
            <SidebarWidget>
              <WidgetTitle>Top Neighborhoods</WidgetTitle>
              <ul className="divide-y divide-gray-100">
                {topNeighborhoods.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <Link
                      href={`/neighborhoods/${n.slug}`}
                      className="flex items-center justify-between py-2.5 text-sm text-gray-dark hover:text-red-brand transition-colors"
                    >
                      {n.name}
                      <span className="text-xs text-gray-mid">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SidebarWidget>

            {/* Cross-link: Browse Events */}
            <div className="border border-gray-100 p-5 mb-6 flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold">
                Browse Events
              </h4>
              <Link
                href="/hub/events"
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-red-brand hover:text-black transition-colors"
              >
                View All →
              </Link>
            </div>

            {/* Ad Slot */}
            <AdBlock variant="sidebar" />
          </div>
        </aside>
      </HubArchiveClient>
    </>
  );
}
