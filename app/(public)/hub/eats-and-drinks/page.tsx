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

const HUB_CONFIG: HubArchiveConfig = {
  detailBasePath: "/places",
  searchPlaceholder: "Search restaurants by name, address, or description…",
  featuredTitle: "Featured Restaurants",
  featuredCountNoun: ["restaurant", "restaurants"],
  ctaTitle: "Get Your Restaurant Featured",
  ctaDescription: "Reach thousands of Atlantans with Premium placement in our dining guide.",
  mapToggleLabel: "Dining Map",
  mapImage: "/images/map.png",
  mapAlt: "Atlanta Dining Map — placeholder",
  gridEyebrow: "Dining",
  gridCountNoun: ["restaurant", "restaurants"],
  loadMoreLabel: "Load More Restaurants",
  emptyNoun: "restaurants",
  submitNoun: "restaurant",
  newsletterDescription: "Get weekly restaurant spotlights, dining deals, and community updates delivered to your inbox.",
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const PH_HERO = "/images/default-hero.png";

/**
 * Known dining-related category slugs.
 * Used to filter categories until 'dining' is added to applies_to.
 */
const DINING_CATEGORY_SLUGS = [
  "dining",
  "nightlife",
  "restaurants",
  "bars",
  "cafes",
  "coffee",
  "food-and-drink",
  "bakeries",
  "breweries",
  "food-trucks",
  "desserts",
  "brunch",
];

/* ============================================================
   DINING HUB — /hub/dining
   ============================================================ */
export default async function EatsAndDrinksHubPage({
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
    getHubFilterData({ categoryMode: { type: "slugList", slugs: DINING_CATEGORY_SLUGS } }),
  ]);

  /* Collect category IDs for hard-filtering all business_listings queries */
  const diningCategIds = filterData.categories.map((c) => c.id);

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
    categoryIds: diningCategIds,
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
        backgroundImage={PH_HERO}
        eyebrow="The Hub"
        title="Dining in Atlanta"
        description="Restaurants, cafés, bars, and local food spots worth knowing."
      />

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "The Hub", href: "/hub" },
            { label: "Eats & Drinks" },
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
            {/* Submit a Business */}
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
