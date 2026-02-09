import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import {
  getAreas,
  getNeighborhoods,
  getNeighborhoodIdsForArea,
  getNeighborhoodsByPopularity,
} from "@/lib/queries";
import { createServerClient } from "@/lib/supabase";
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
  searchPlaceholder: "Search businesses by name, address, or description…",
  featuredTitle: "Premium Partners",
  featuredCountNoun: ["business", "businesses"],
  ctaTitle: "Get Your Business Featured",
  ctaDescription: "Reach thousands of Atlantans with a Premium placement in our directory.",
  mapToggleLabel: "Business Map",
  mapImage: "https://placehold.co/1280x400/e8e8e8/999?text=Map+Placeholder",
  mapAlt: "Atlanta Business Map — placeholder",
  gridEyebrow: "Businesses",
  gridCountNoun: ["business", "businesses"],
  loadMoreLabel: "Load More Businesses",
  emptyNoun: "businesses",
  submitNoun: "business",
  newsletterDescription: "Get weekly business spotlights, local deals, and community updates delivered to your inbox.",
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const PH_HERO = "/images/default-hero.png";

/* ============================================================
   BUSINESS HUB — /hub/businesses
   ============================================================ */
export default async function BusinessHubPage({
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
  const [areas, allNeighborhoods] = await Promise.all([
    getAreas(),
    getNeighborhoods(),
  ]);

  /* Categories that apply to businesses */
  type LookupRow = { id: string; name: string; slug: string };

  const supabase = createServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .contains("applies_to", ["business"])
    .eq("is_active", true)
    .order("name")
    .returns<LookupRow[]>();

  /* Tags for tag pills */
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")
    .returns<LookupRow[]>();

  /* Amenities for filter dropdown */
  const { data: amenities } = await supabase
    .from("amenities")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")
    .returns<LookupRow[]>();

  /* Identity options for filter dropdown */
  const { data: identityOptions } = await supabase
    .from("business_identity_options")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name")
    .returns<LookupRow[]>();

  /* ---------- Resolve area → neighborhood IDs ---------- */
  let neighborhoodFilter: string[] | undefined;
  if (sp.neighborhood) {
    const nh = allNeighborhoods.find((n) => n.slug === sp.neighborhood);
    if (nh) neighborhoodFilter = [nh.id];
  } else if (sp.area) {
    const area = areas.find((a) => a.slug === sp.area);
    if (area) {
      neighborhoodFilter = await getNeighborhoodIdsForArea(area.id);
    }
  }

  /* ---------- Featured businesses (Premium tier) ---------- */
  let featuredQuery = supabase
    .from("business_listings")
    .select(
      "id, business_name, slug, tagline, street_address, city, price_range, tier, logo, latitude, longitude, neighborhood_id, category_id, created_at, neighborhoods(name, slug), categories(name, slug)"
    )
    .eq("status", "active")
    .eq("tier", "Premium")
    .order("created_at", { ascending: false })
    .limit(6);

  if (neighborhoodFilter?.length) {
    featuredQuery = featuredQuery.in("neighborhood_id", neighborhoodFilter);
  }
  if (sp.category) {
    const cat = (categories ?? []).find((c: any) => c.slug === sp.category);
    if (cat) featuredQuery = featuredQuery.eq("category_id", cat.id);
  }

  const { data: rawFeatured } = await featuredQuery;
  const featuredIds = (rawFeatured ?? []).map((b: any) => b.id);

  /* Fetch primary images for featured businesses */
  let featuredImages: Record<string, string> = {};
  if (featuredIds.length) {
    const { data: imgData } = await supabase
      .from("business_images")
      .select("business_id, image_url")
      .in("business_id", featuredIds)
      .eq("is_primary", true);
    if (imgData) {
      featuredImages = Object.fromEntries(
        imgData.map((i: any) => [i.business_id, i.image_url])
      );
    }
  }

  const featuredBusinesses = (rawFeatured ?? []).map((b: any) => ({
    ...b,
    primary_image_url: featuredImages[b.id] || b.logo || null,
  }));

  /* ---------- Grid businesses (active, dedup featured) ---------- */
  let gridQuery = supabase
    .from("business_listings")
    .select(
      "id, business_name, slug, tagline, street_address, city, price_range, tier, logo, latitude, longitude, neighborhood_id, category_id, created_at, neighborhoods(name, slug), categories(name, slug)",
      { count: "exact" }
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  /* Exclude featured IDs from first page */
  if (featuredIds.length) {
    gridQuery = gridQuery.not("id", "in", `(${featuredIds.join(",")})`);
  }

  /* Apply filters */
  if (neighborhoodFilter?.length) {
    gridQuery = gridQuery.in("neighborhood_id", neighborhoodFilter);
  }
  if (sp.category) {
    const cat = (categories ?? []).find((c: any) => c.slug === sp.category);
    if (cat) gridQuery = gridQuery.eq("category_id", cat.id);
  }
  if (sp.tier) {
    gridQuery = gridQuery.eq("tier", sp.tier);
  }
  if (sp.q) {
    gridQuery = gridQuery.or(
      `business_name.ilike.%${sp.q}%,tagline.ilike.%${sp.q}%,description.ilike.%${sp.q}%,street_address.ilike.%${sp.q}%,city.ilike.%${sp.q}%`
    );
  }

  /* Tag filter via join table */
  if (sp.tag) {
    const { data: taggedIds } = await supabase
      .from("business_tags")
      .select("business_id, tags!inner(slug)")
      .eq("tags.slug", sp.tag);
    if (taggedIds?.length) {
      gridQuery = gridQuery.in(
        "id",
        taggedIds.map((t: any) => t.business_id)
      );
    } else {
      gridQuery = gridQuery.in("id", ["__none__"]); // force empty
    }
  }

  /* Amenity filter via join table */
  if (sp.amenity) {
    const { data: amenityIds } = await supabase
      .from("business_amenities")
      .select("business_id, amenities!inner(slug)")
      .eq("amenities.slug", sp.amenity);
    if (amenityIds?.length) {
      gridQuery = gridQuery.in(
        "id",
        amenityIds.map((a: any) => a.business_id)
      );
    } else {
      gridQuery = gridQuery.in("id", ["__none__"]);
    }
  }

  /* Identity filter via join table */
  if (sp.identity) {
    const { data: identityIds } = await supabase
      .from("business_identities")
      .select("business_id, business_identity_options!inner(slug)")
      .eq("business_identity_options.slug", sp.identity);
    if (identityIds?.length) {
      gridQuery = gridQuery.in(
        "id",
        identityIds.map((i: any) => i.business_id)
      );
    } else {
      gridQuery = gridQuery.in("id", ["__none__"]);
    }
  }

  /* Sort: newest (Premium businesses already highlighted in Featured section) */
  gridQuery = gridQuery
    .order("created_at", { ascending: false })
    .limit(12);

  const { data: rawGrid, count: gridCount } = await gridQuery;
  const gridIds = (rawGrid ?? []).map((b: any) => b.id);

  /* Fetch primary images for grid */
  let gridImages: Record<string, string> = {};
  if (gridIds.length) {
    const { data: imgData } = await supabase
      .from("business_images")
      .select("business_id, image_url")
      .in("business_id", gridIds)
      .eq("is_primary", true);
    if (imgData) {
      gridImages = Object.fromEntries(
        imgData.map((i: any) => [i.business_id, i.image_url])
      );
    }
  }

  const gridBusinesses = (rawGrid ?? []).map((b: any) => ({
    ...b,
    primary_image_url: gridImages[b.id] || b.logo || null,
  }));

  /* ---------- Map businesses ---------- */
  const { data: mapData } = await supabase
    .from("business_listings")
    .select("id, business_name, slug, latitude, longitude, tier")
    .eq("status", "active")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  const mapBusinesses = (mapData ?? []).map((b: any) => ({
    id: b.id,
    business_name: b.business_name,
    slug: b.slug,
    latitude: b.latitude,
    longitude: b.longitude,
    tier: b.tier,
  }));

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
     JSON-LD
     ============================================================ */
  const breadcrumbSchema = {
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
        item: "https://atlvibesandviews.com/hub",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Shop Local",
      },
    ],
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ========== 1. HERO ========== */}
      {/* Desktop hero */}
      <section className="hidden lg:block bg-black">
        <div className="grid grid-cols-2 min-h-[480px]">
          <div className="relative overflow-hidden bg-[#111]">
            <Image
              src={PH_HERO}
              alt="Shop Local Atlanta"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center px-16">
            <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-4">
              The Hub
            </span>
            <h1 className="font-display text-[56px] font-semibold text-white leading-[1.05]">
              Shop Local Atlanta
            </h1>
            <p className="text-white/60 text-[15px] mt-4 max-w-[420px] leading-relaxed">
              Discover Atlanta&apos;s best local businesses — from restaurants
              and boutiques to services and community favorites.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile hero */}
      <section className="lg:hidden bg-black">
        <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
          <Image
            src={PH_HERO}
            alt="Shop Local Atlanta"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
          >
            <span className="text-[#e6c46d] text-[10px] font-semibold uppercase tracking-[0.15em]">
              The Hub
            </span>
            <h1 className="font-display text-3xl font-semibold text-white leading-[1.1] mt-1">
              Shop Local Atlanta
            </h1>
          </div>
        </div>
        <div className="px-4 py-5 bg-black">
          <p className="text-white/60 text-[13px]">
            Discover Atlanta&apos;s best local businesses — from restaurants and
            boutiques to services and community favorites.
          </p>
        </div>
      </section>

      {/* ========== 2. BREADCRUMBS ========== */}
      <div className="site-container pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-mid">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="hover:text-black transition-colors">The Hub</span>
          <ChevronRight size={12} />
          <span className="text-black font-medium">Shop Local</span>
        </nav>
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
        categories={(categories ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))}
        tags={(tags ?? []).map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
        }))}
        amenities={(amenities ?? []).map((a: any) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
        }))}
        identityOptions={(identityOptions ?? []).map((i: any) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
        }))}
        featuredBusinesses={featuredBusinesses}
        mapBusinesses={mapBusinesses}
        gridBusinesses={gridBusinesses}
        totalGridCount={gridCount ?? 0}
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
            <div className="w-full h-[250px] bg-gray-light border border-dashed border-gray-mid flex items-center justify-center mb-6">
              <span className="text-[11px] text-gray-mid uppercase tracking-widest">
                Ad — Sidebar
              </span>
            </div>
          </div>
        </aside>
      </HubArchiveClient>
    </>
  );
}
