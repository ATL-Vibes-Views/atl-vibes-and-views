/* ============================================================
   SUPABASE QUERIES — Matched to live schema
   
   Every query function is server-safe (uses createServerClient).
   All list queries accept an optional `search` param for
   site-wide and page-level search.
   ============================================================ */

import { createServerClient } from "./supabase";
import type {
  Area,
  Neighborhood,
  BlogPost,
  BlogPostWithAuthor,
  BlogPostFull,
  BusinessListing,
  BusinessListingWithNeighborhood,
  EventItem,
  EventItemWithNeighborhood,
  Author,
  Category,
  City,
  Story,
  NeighborhoodWithArea,
  ContentIndex,
  MediaItem,
  MediaAsset,
  MediaItemLink,
  Amenity,
  IdentityOption,
  NeighborhoodGrouped,
  Newsletter,
  NewsletterType,
  NewsletterSection,
  NewsletterPost,
} from "./types";

/* Module-level singleton — reuse one client per serverless invocation
   instead of creating a fresh TCP+TLS connection per query call.
   This prevents connection exhaustion on Vercel cold starts. */
const _sb = createServerClient();
function sb() {
  return _sb;
}

/* ============================================================
   AREAS
   ============================================================ */

export async function getAreas(): Promise<Area[]> {
  const { data, error } = await sb()
    .from("areas")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const { data, error } = await sb()
    .from("areas")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data;
}

/* ============================================================
   NEIGHBORHOODS
   ============================================================ */

export async function getNeighborhoods(opts?: {
  areaId?: string;
  search?: string;
  limit?: number;
  featured?: boolean;
}): Promise<Neighborhood[]> {
  let q = sb()
    .from("neighborhoods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (opts?.areaId) q = q.eq("area_id", opts.areaId);
  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.search) q = q.ilike("name", `%${opts.search}%`);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

export async function getNeighborhoodBySlug(
  slug: string
): Promise<NeighborhoodWithArea | null> {
  const { data, error } = await sb()
    .from("neighborhoods")
    .select("*, areas(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data;
}

/* ============================================================
   BLOG POSTS
   ============================================================ */

export async function getBlogPosts(opts?: {
  search?: string;
  categoryId?: string;
  neighborhoodIds?: string[];
  featured?: boolean;
  limit?: number;
  status?: string;
  contentType?: string;
}): Promise<BlogPostWithAuthor[]> {
  let q = sb()
    .from("blog_posts")
    .select("*, authors(*), categories(*)")
    .eq("status", opts?.status ?? "published")
    .order("published_at", { ascending: false });

  if (opts?.contentType) q = q.eq("content_type", opts.contentType);
  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.neighborhoodIds?.length)
    q = q.in("neighborhood_id", opts.neighborhoodIds);
  if (opts?.search)
    q = q.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return (data as BlogPostWithAuthor[]) ?? [];
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostWithAuthor | null> {
  const { data, error } = await sb()
    .from("blog_posts")
    .select("*, authors(*), categories(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as BlogPostWithAuthor | null;
}

export async function getBlogPostById(
  id: string
): Promise<BlogPostWithAuthor | null> {
  const { data, error } = await sb()
    .from("blog_posts")
    .select("*, authors(*), categories(*)")
    .eq("id", id)
    .eq("status", "published")
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as BlogPostWithAuthor | null;
}

/** Blog posts with neighborhood + area joins (for archive pages) */
export async function getBlogPostsWithNeighborhood(opts?: {
  contentType?: string;
  categoryId?: string;
  neighborhoodIds?: string[];
  search?: string;
  featured?: boolean;
  limit?: number;
}): Promise<BlogPostFull[]> {
  let q = sb()
    .from("blog_posts")
    .select("*, authors(*), categories(*), neighborhoods(*, areas(*))")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (opts?.contentType) q = q.eq("content_type", opts.contentType);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.neighborhoodIds?.length)
    q = q.in("neighborhood_id", opts.neighborhoodIds);
  if (opts?.search)
    q = q.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return (data as BlogPostFull[]) ?? [];
}

/** Full blog post by slug — includes neighborhood + area joins */
export async function getBlogPostBySlugFull(
  slug: string
): Promise<BlogPostFull | null> {
  const { data, error } = await sb()
    .from("blog_posts")
    .select("*, authors(*), categories(*), neighborhoods(*, areas(*))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as BlogPostFull | null;
}

/** Businesses linked to a blog post via post_businesses join table */
export async function getBusinessesByPostId(
  postId: string,
  limit = 10
): Promise<BusinessListingWithNeighborhood[]> {
  const { data: links, error: linkErr } = await sb()
    .from("post_businesses")
    .select("business_id")
    .eq("post_id", postId)
    .returns<{ business_id: string }[]>();
  if (linkErr || !links?.length) return [];

  const bizIds = links.map((l) => l.business_id);
  const { data, error } = await sb()
    .from("business_listings")
    .select("*, neighborhoods(*), categories(*), cities(name)")
    .in("id", bizIds)
    .eq("status", "active")
    .limit(limit);
  if (error) { console.error("[queries]", error.message); }
  return (data as BusinessListingWithNeighborhood[]) ?? [];
}

/* ============================================================
   BUSINESS LISTINGS
   ============================================================ */

export async function getBusinesses(opts?: {
  search?: string;
  categoryId?: string;
  neighborhoodIds?: string[];
  cityId?: string;
  featured?: boolean;
  limit?: number;
  status?: string;
}): Promise<BusinessListingWithNeighborhood[]> {
  let q = sb()
    .from("business_listings")
    .select("*, neighborhoods(*), categories(*), cities(name)")
    .eq("status", opts?.status ?? "active")
    .order("is_featured", { ascending: false })
    .order("business_name");

  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.cityId) q = q.eq("city_id", opts.cityId);
  if (opts?.neighborhoodIds?.length)
    q = q.in("neighborhood_id", opts.neighborhoodIds);
  if (opts?.search)
    q = q.or(
      `business_name.ilike.%${opts.search}%,description.ilike.%${opts.search}%,tagline.ilike.%${opts.search}%`
    );
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return (data as BusinessListingWithNeighborhood[]) ?? [];
}

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessListingWithNeighborhood | null> {
  const { data, error } = await sb()
    .from("business_listings")
    .select("*, neighborhoods(*), categories(*), cities(name)")
    .eq("slug", slug)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as BusinessListingWithNeighborhood | null;
}

/* ============================================================
   EVENTS
   ============================================================ */

export async function getEvents(opts?: {
  search?: string;
  categoryId?: string;
  neighborhoodIds?: string[];
  cityId?: string;
  featured?: boolean;
  upcoming?: boolean;
  limit?: number;
  status?: string;
}): Promise<EventItemWithNeighborhood[]> {
  let q = sb()
    .from("events")
    .select("*, neighborhoods(*), categories(*), cities(name)")
    .eq("status", opts?.status ?? "active")
    .order("start_date");

  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.upcoming) q = q.gte("start_date", new Date().toISOString().split("T")[0]);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.cityId) q = q.eq("city_id", opts.cityId);
  if (opts?.neighborhoodIds?.length)
    q = q.in("neighborhood_id", opts.neighborhoodIds);
  if (opts?.search)
    q = q.or(
      `title.ilike.%${opts.search}%,description.ilike.%${opts.search}%,venue_name.ilike.%${opts.search}%`
    );
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return (data as EventItemWithNeighborhood[]) ?? [];
}

export async function getEventBySlug(
  slug: string
): Promise<EventItemWithNeighborhood | null> {
  const { data, error } = await sb()
    .from("events")
    .select("*, neighborhoods(*), categories(*), cities(name)")
    .eq("slug", slug)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as EventItemWithNeighborhood | null;
}

/* ============================================================
   AUTHORS
   ============================================================ */

export async function getAuthors(): Promise<Author[]> {
  const { data, error } = await sb()
    .from("authors")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const { data, error } = await sb()
    .from("authors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data;
}

/* ============================================================
   CATEGORIES
   ============================================================ */

export async function getCategories(opts?: {
  appliesTo?: string;
}): Promise<Category[]> {
  let q = sb()
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (opts?.appliesTo) q = q.contains("applies_to", [opts.appliesTo]);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await sb()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data;
}

/* ============================================================
   CITIES
   ============================================================ */

export async function getCities(opts?: {
  primary?: boolean;
  excludePrimary?: boolean;
  excludeId?: string;
}): Promise<City[]> {
  let q = sb()
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (opts?.primary) q = q.eq("is_primary", true);
  if (opts?.excludePrimary) q = q.eq("is_primary", false);
  if (opts?.excludeId) q = q.neq("id", opts.excludeId);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const { data, error } = await sb()
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data;
}

/* ============================================================
   STORIES (news intake)
   ============================================================ */

export async function getStories(opts?: {
  search?: string;
  limit?: number;
  status?: string;
}): Promise<Story[]> {
  let q = sb()
    .from("stories")
    .select("*")
    // Stories status values: new → queued → reviewed → used
    // "used" = story was turned into a published blog post
    .eq("status", opts?.status ?? "used")
    .order("published_at", { ascending: false });

  if (opts?.search) q = q.ilike("headline", `%${opts.search}%`);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

/* ============================================================
   FEATURED SLOTS
   ============================================================ */

export async function getFeaturedSlot(
  placementKey: string
): Promise<{ entity_type: string; entity_id: string } | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await sb()
    .from("featured_slots")
    .select("entity_type, entity_id")
    .eq("placement_key", placementKey)
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("sort_order")
    .limit(1)
    .returns<{ entity_type: string; entity_id: string }[]>();
  if (error) { console.error("[queries]", error.message); }
  return data?.[0] ?? null;
}

/* ============================================================
   CONVENIENCE WRAPPERS — used by homepage & area pages
   ============================================================ */

/** Featured blog posts (is_featured = true, published) */
export async function getFeaturedPosts(
  limit = 3
): Promise<BlogPostWithAuthor[]> {
  return getBlogPosts({ featured: true, limit });
}

/** Latest blog posts (published, newest first) */
export async function getLatestPosts(
  limit = 3
): Promise<BlogPostWithAuthor[]> {
  return getBlogPosts({ limit });
}

/** Blog posts filtered by neighborhood IDs */
export async function getPostsByNeighborhoodIds(
  neighborhoodIds: string[],
  limit = 4
): Promise<BlogPostWithAuthor[]> {
  if (!neighborhoodIds.length) return [];
  return getBlogPosts({ neighborhoodIds, limit });
}

/** Featured businesses (is_featured = true, active) */
export async function getFeaturedBusinesses(opts?: {
  neighborhoodIds?: string[];
  limit?: number;
}): Promise<BusinessListingWithNeighborhood[]> {
  return getBusinesses({
    featured: true,
    neighborhoodIds: opts?.neighborhoodIds,
    limit: opts?.limit,
  });
}

/** Upcoming events (start_date >= today, published) */
export async function getUpcomingEvents(opts?: {
  neighborhoodIds?: string[];
  limit?: number;
}): Promise<EventItemWithNeighborhood[]> {
  return getEvents({
    upcoming: true,
    neighborhoodIds: opts?.neighborhoodIds,
    limit: opts?.limit,
  });
}


/* ============================================================
   GLOBAL SEARCH — searches across all content types
   ============================================================ */

export interface SearchResult {
  type: "blog_post" | "business" | "event" | "neighborhood" | "area";
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  url: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const term = query.trim();
  const results: SearchResult[] = [];

  // Search blog posts
  const { data: posts } = await sb()
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image_url")
    .eq("status", "published")
    .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
    .limit(5)
    .returns<{ id: string; title: string; slug: string; excerpt: string | null; featured_image_url: string | null }[]>();

  if (posts) {
    results.push(
      ...posts.map((p) => ({
        type: "blog_post" as const,
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt ?? undefined,
        image: p.featured_image_url ?? undefined,
        url: `/stories/${p.slug}`,
      }))
    );
  }

  // Search businesses
  const { data: biz } = await sb()
    .from("business_listings")
    .select("id, business_name, slug, tagline, logo")
    .eq("status", "active")
    .or(
      `business_name.ilike.%${term}%,description.ilike.%${term}%,tagline.ilike.%${term}%`
    )
    .limit(5)
    .returns<{ id: string; business_name: string; slug: string; tagline: string | null; logo: string | null }[]>();

  if (biz) {
    results.push(
      ...biz.map((b) => ({
        type: "business" as const,
        id: b.id,
        title: b.business_name,
        slug: b.slug,
        excerpt: b.tagline ?? undefined,
        image: b.logo ?? undefined,
        url: `/places/${b.slug}`,
      }))
    );
  }

  // Search events
  const { data: events } = await sb()
    .from("events")
    .select("id, title, slug, tagline, featured_image_url")
    .eq("status", "active")
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(5)
    .returns<{ id: string; title: string; slug: string; tagline: string | null; featured_image_url: string | null }[]>();

  if (events) {
    results.push(
      ...events.map((e) => ({
        type: "event" as const,
        id: e.id,
        title: e.title,
        slug: e.slug,
        excerpt: e.tagline ?? undefined,
        image: e.featured_image_url ?? undefined,
        url: `/events/${e.slug}`,
      }))
    );
  }

  // Search neighborhoods
  const { data: hoods } = await sb()
    .from("neighborhoods")
    .select("id, name, slug, tagline")
    .eq("is_active", true)
    .ilike("name", `%${term}%`)
    .limit(5)
    .returns<{ id: string; name: string; slug: string; tagline: string | null }[]>();

  if (hoods) {
    results.push(
      ...hoods.map((n) => ({
        type: "neighborhood" as const,
        id: n.id,
        title: n.name,
        slug: n.slug,
        excerpt: n.tagline ?? undefined,
        url: `/neighborhoods/${n.slug}`,
      }))
    );
  }

  // Search areas
  const { data: areas } = await sb()
    .from("areas")
    .select("id, name, slug, tagline")
    .eq("is_active", true)
    .ilike("name", `%${term}%`)
    .limit(5)
    .returns<{ id: string; name: string; slug: string; tagline: string | null }[]>();

  if (areas) {
    results.push(
      ...areas.map((a) => ({
        type: "area" as const,
        id: a.id,
        title: a.name,
        slug: a.slug,
        excerpt: a.tagline ?? undefined,
        url: `/areas/${a.slug}`,
      }))
    );
  }

  return results;
}

/* ============================================================
   HELPER: Get neighborhood IDs for an area
   Used to scope business/event/post queries to an area.
   ============================================================ */

export async function getNeighborhoodIdsForArea(
  areaId: string
): Promise<string[]> {
  const { data, error } = await sb()
    .from("neighborhoods")
    .select("id")
    .eq("area_id", areaId)
    .eq("is_active", true)
    .returns<{ id: string }[]>();
  if (error) { console.error("[queries]", error.message); }
  return (data ?? []).map((n) => n.id);
}

/* ============================================================
   HELPER: Get neighborhoods ranked by content popularity
   Used for sidebar "Featured Neighborhoods" widgets.
   Ranking: story count desc → business count desc → name asc
   ============================================================ */

export async function getNeighborhoodsByPopularity(opts?: {
  limit?: number;
}): Promise<Neighborhood[]> {
  const limit = opts?.limit ?? 8;

  /* Fetch all active neighborhoods */
  const { data: neighborhoods, error: nErr } = await sb()
    .from("neighborhoods")
    .select("*")
    .eq("is_active", true)
    .returns<Neighborhood[]>();
  if (nErr) throw nErr;
  if (!neighborhoods?.length) return [];

  /* Count published blog_posts per neighborhood_id */
  const { data: postCounts, error: pcErr } = await sb()
    .from("blog_posts")
    .select("neighborhood_id")
    .eq("status", "published")
    .not("neighborhood_id", "is", null)
    .returns<{ neighborhood_id: string }[]>();

  /* Count active business_listings per neighborhood_id */
  const { data: bizCounts, error: bcErr } = await sb()
    .from("business_listings")
    .select("neighborhood_id")
    .eq("status", "active")
    .not("neighborhood_id", "is", null)
    .returns<{ neighborhood_id: string }[]>();

  /* Build count maps */
  const storyMap = new Map<string, number>();
  if (!pcErr && postCounts) {
    for (const row of postCounts) {
      storyMap.set(row.neighborhood_id, (storyMap.get(row.neighborhood_id) ?? 0) + 1);
    }
  }

  const bizMap = new Map<string, number>();
  if (!bcErr && bizCounts) {
    for (const row of bizCounts) {
      bizMap.set(row.neighborhood_id, (bizMap.get(row.neighborhood_id) ?? 0) + 1);
    }
  }

  /* Sort: story count desc → business count desc → name asc */
  const sorted = [...neighborhoods].sort((a, b) => {
    const aStories = storyMap.get(a.id) ?? 0;
    const bStories = storyMap.get(b.id) ?? 0;
    if (bStories !== aStories) return bStories - aStories;

    const aBiz = bizMap.get(a.id) ?? 0;
    const bBiz = bizMap.get(b.id) ?? 0;
    if (bBiz !== aBiz) return bBiz - aBiz;

    return a.name.localeCompare(b.name);
  });

  return sorted.slice(0, limit);
}

/* ============================================================
   CONTENT INDEX
   ============================================================ */

export async function getContentIndexByToken(
  tokenName: string,
  opts?: { targetType?: string; activeUrl?: string }
): Promise<ContentIndex | null> {
  let q = sb()
    .from("content_index")
    .select("*")
    .eq("token_name", tokenName)
    .eq("is_active", true);

  if (opts?.targetType) q = q.eq("target_type", opts.targetType);
  if (opts?.activeUrl) q = q.eq("active_url", opts.activeUrl);

  const { data, error } = await q.single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as ContentIndex | null;
}

/* ============================================================
   MEDIA ITEMS
   ============================================================ */

/* ============================================================
   NEIGHBORHOODS — grouped by area (for submit form dropdown)
   ============================================================ */

export async function getNeighborhoodsGrouped(): Promise<NeighborhoodGrouped[]> {
  const { data, error } = await sb()
    .from("neighborhoods")
    .select("id, name, slug, areas(name, slug)")
    .eq("is_active", true)
    .order("name")
    .returns<{ id: string; name: string; slug: string; areas: { name: string; slug: string } }[]>();
  if (error) { console.error("[queries]", error.message); }
  if (!data?.length) return [];

  /* Count published posts per neighborhood via post_neighborhoods join */
  const { data: postLinks } = await sb()
    .from("post_neighborhoods")
    .select("neighborhood_id")
    .returns<{ neighborhood_id: string }[]>();

  const storyCount = new Map<string, number>();
  if (postLinks) {
    for (const row of postLinks) {
      storyCount.set(row.neighborhood_id, (storyCount.get(row.neighborhood_id) ?? 0) + 1);
    }
  }

  const grouped = new Map<string, NeighborhoodGrouped>();
  for (const n of data) {
    const areaName = n.areas?.name ?? "Other";
    const areaSlug = n.areas?.slug ?? "other";
    if (!grouped.has(areaSlug)) {
      grouped.set(areaSlug, { area_name: areaName, area_slug: areaSlug, neighborhoods: [] });
    }
    grouped.get(areaSlug)!.neighborhoods.push({ id: n.id, name: n.name, slug: n.slug });
  }

  /* Sort each area's neighborhoods by story count desc, then name asc; keep top 10 */
  for (const group of grouped.values()) {
    group.neighborhoods.sort((a, b) => {
      const diff = (storyCount.get(b.id) ?? 0) - (storyCount.get(a.id) ?? 0);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
    group.neighborhoods = group.neighborhoods.slice(0, 10);
  }

  return Array.from(grouped.values()).sort((a, b) => a.area_name.localeCompare(b.area_name));
}

/* ============================================================
   AMENITIES
   ============================================================ */

export async function getAmenities(): Promise<Amenity[]> {
  const { data, error } = await sb()
    .from("amenities")
    .select("id, name, amenity_group, sort_order")
    .order("sort_order")
    .returns<Amenity[]>();
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

/* ============================================================
   BUSINESS IDENTITY OPTIONS
   ============================================================ */

export async function getIdentityOptions(): Promise<IdentityOption[]> {
  const { data, error } = await sb()
    .from("business_identity_options")
    .select("id, name, sort_order")
    .order("sort_order")
    .returns<IdentityOption[]>();
  if (error) { console.error("[queries]", error.message); }
  return data ?? [];
}

/* ============================================================
   MEDIA ITEMS
   ============================================================ */

export async function getMediaItems(opts?: {
  mediaType?: string;
  limit?: number;
  featured?: boolean;
  excludeId?: string;
  targetType?: string;
  targetIds?: string[];
}): Promise<MediaItem[]> {
  let q = sb()
    .from("media_items")
    .select("*")
    .eq("status", "published")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (opts?.mediaType) q = q.eq("media_type", opts.mediaType);
  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.excludeId) q = q.neq("id", opts.excludeId);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error("[queries]", error.message); }

  let items = (data ?? []) as MediaItem[];

  /* If targeting specific area links, filter via media_item_links */
  if (opts?.targetType && opts?.targetIds?.length) {
    const { data: links, error: linkErr } = await sb()
      .from("media_item_links")
      .select("media_item_id")
      .eq("target_type", opts.targetType)
      .in("target_id", opts.targetIds)
      .returns<{ media_item_id: string }[]>();
    if (!linkErr && links?.length) {
      const linkedIds = new Set(links.map((l) => l.media_item_id));
      items = items.filter((m) => linkedIds.has(m.id));
    }
  }

  return items;
}

export async function getMediaItemBySlug(
  slug: string
): Promise<MediaItem | null> {
  const { data, error } = await sb()
    .from("media_items")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") { console.error("[queries]", error.message); }
  return data as MediaItem | null;
}

export async function getMediaItemAssets(mediaItemId: string) {
  const { data, error } = await sb()
    .from("media_item_assets")
    .select("*, media_assets(*)")
    .eq("media_item_id", mediaItemId)
    .order("sort_order", { ascending: true })
    .returns<Array<{ id: string; role: string; is_primary: boolean; sort_order: number; media_assets: MediaAsset }>>();
  if (error) {
    console.error("getMediaItemAssets error:", error);
    return [];
  }
  return data ?? [];
}

export async function getMediaItemLinks(mediaItemId: string): Promise<MediaItemLink[]> {
  const { data, error } = await sb()
    .from("media_item_links")
    .select("*")
    .eq("media_item_id", mediaItemId)
    .order("sort_order", { ascending: true })
    .returns<MediaItemLink[]>();
  if (error) {
    console.error("getMediaItemLinks error:", error);
    return [];
  }
  return data ?? [];
}

/* ============================================================
   NEWSLETTERS
   ============================================================ */

export async function getNewsletters(opts?: {
  limit?: number;
}): Promise<Newsletter[]> {
  try {
    let q = sb()
      .from("newsletters")
      .select("*")
      .eq("status", "sent")
      .eq("is_public", true)
      .order("issue_date", { ascending: false });

    if (opts?.limit) q = q.limit(opts.limit);

    const { data, error } = await q.returns<Newsletter[]>();
    if (error) {
      console.error("getNewsletters error:", error.message);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/* ============================================================
   NEWSLETTER TYPES (standalone series catalog)
   ============================================================ */

export async function getNewsletterTypes(): Promise<NewsletterType[]> {
  const { data, error } = await sb()
    .from("newsletter_types")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .returns<NewsletterType[]>();
  if (error) {
    console.error("getNewsletterTypes error:", error.message);
    return [];
  }
  return data ?? [];
}

/** Single newsletter by issue_slug */
export async function getNewsletterBySlug(
  issueSlug: string
): Promise<Newsletter | null> {
  const { data, error } = await sb()
    .from("newsletters")
    .select("*")
    .eq("issue_slug", issueSlug)
    .eq("status", "sent")
    .eq("is_public", true)
    .single()
    .returns<Newsletter>();
  if (error && error.code !== "PGRST116") {
    console.error("getNewsletterBySlug error:", error.message);
    return null;
  }
  return data;
}

/** Newsletters filtered by type name, with optional search */
export async function getNewslettersByType(opts?: {
  typeName?: string;
  search?: string;
  limit?: number;
}): Promise<Newsletter[]> {
  try {
    let q = sb()
      .from("newsletters")
      .select("*")
      .eq("status", "sent")
      .eq("is_public", true)
      .order("issue_date", { ascending: false });

    if (opts?.typeName) q = q.eq("name", opts.typeName);
    if (opts?.search)
      q = q.or(
        `subject_line.ilike.%${opts.search}%,preview_text.ilike.%${opts.search}%`
      );
    if (opts?.limit) q = q.limit(opts.limit);

    const { data, error } = await q.returns<Newsletter[]>();
    if (error) {
      console.error("getNewslettersByType error:", error.message);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

/** Previous and next newsletters (by issue_date) for navigation */
export async function getAdjacentNewsletters(
  issueDate: string,
  currentId: string
): Promise<{ prev: Newsletter | null; next: Newsletter | null }> {
  const [prevRes, nextRes] = await Promise.all([
    sb()
      .from("newsletters")
      .select("*")
      .eq("status", "sent")
      .eq("is_public", true)
      .lt("issue_date", issueDate)
      .order("issue_date", { ascending: false })
      .limit(1)
      .returns<Newsletter[]>(),
    sb()
      .from("newsletters")
      .select("*")
      .eq("status", "sent")
      .eq("is_public", true)
      .gt("issue_date", issueDate)
      .order("issue_date", { ascending: true })
      .limit(1)
      .returns<Newsletter[]>(),
  ]);

  return {
    prev: prevRes.data?.[0] ?? null,
    next: nextRes.data?.[0] ?? null,
  };
}

/* ============================================================
   NEWSLETTER SECTIONS & POSTS (structured content)
   ============================================================ */

/** Sections for a newsletter issue, ordered by sort_order */
export async function getNewsletterSections(
  newsletterId: string
): Promise<NewsletterSection[]> {
  const { data, error } = await sb()
    .from("newsletter_sections")
    .select("*")
    .eq("newsletter_id", newsletterId)
    .order("sort_order", { ascending: true })
    .returns<NewsletterSection[]>();
  if (error) {
    console.error("getNewsletterSections error:", error.message);
    return [];
  }
  return data ?? [];
}

/** Blog posts linked to a newsletter, joined with blog_posts, ordered by position */
export interface NewsletterPostWithBlog extends NewsletterPost {
  blog_post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    category_id: string | null;
  } | null;
}

export async function getNewsletterPosts(
  newsletterId: string
): Promise<NewsletterPostWithBlog[]> {
  const { data, error } = await sb()
    .from("newsletter_posts")
    .select(
      "*, blog_post:post_id(id, title, slug, excerpt, featured_image_url, published_at, category_id)"
    )
    .eq("newsletter_id", newsletterId)
    .order("position", { ascending: true })
    .returns<NewsletterPostWithBlog[]>();
  if (error) {
    console.error("getNewsletterPosts error:", error.message);
    return [];
  }
  return data ?? [];
}

/** Batch-fetch the first blog_post featured_image_url for each newsletter (for archive cards) */
export async function getNewsletterFeaturedImages(): Promise<
  Map<string, string>
> {
  const { data, error } = await sb()
    .from("newsletter_posts")
    .select("newsletter_id, blog_post:post_id(featured_image_url)")
    .order("position", { ascending: true })
    .returns<
      {
        newsletter_id: string;
        blog_post: { featured_image_url: string | null } | null;
      }[]
    >();
  if (error) {
    console.error("getNewsletterFeaturedImages error:", error.message);
    return new Map();
  }
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (!map.has(row.newsletter_id) && row.blog_post?.featured_image_url) {
      map.set(row.newsletter_id, row.blog_post.featured_image_url);
    }
  }
  return map;
}

/* ============================================================
   HUB ARCHIVE — shared filter & business queries
   Used by /hub/businesses, /hub/eats-and-drinks, /hub/things-to-do
   ============================================================ */

type HubLookupRow = { id: string; name: string; slug: string };

export interface HubFilterData {
  categories: HubLookupRow[];
  tags: HubLookupRow[];
  amenities: HubLookupRow[];
  identityOptions: HubLookupRow[];
}

/**
 * Fetch filter-dropdown data (categories, tags, amenities, identity options)
 * for a hub archive page.
 */
export async function getHubFilterData(opts: {
  categoryMode:
    | { type: "appliesTo"; value: string }
    | { type: "slugList"; slugs: string[] };
}): Promise<HubFilterData> {
  const supabase = sb();

  let catQuery = supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  if (opts.categoryMode.type === "appliesTo") {
    catQuery = catQuery.contains("applies_to", [opts.categoryMode.value]);
  } else {
    catQuery = catQuery.in("slug", opts.categoryMode.slugs);
  }

  const [catRes, tagRes, amenityRes, identityRes] = await Promise.all([
    catQuery.returns<HubLookupRow[]>(),
    supabase
      .from("tags")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name")
      .returns<HubLookupRow[]>(),
    supabase
      .from("amenities")
      .select("id, name, slug")
      .order("name")
      .returns<HubLookupRow[]>(),
    supabase
      .from("business_identity_options")
      .select("id, name, slug")
      .order("name")
      .returns<HubLookupRow[]>(),
  ]);

  return {
    categories: catRes.data ?? [],
    tags: tagRes.data ?? [],
    amenities: amenityRes.data ?? [],
    identityOptions: identityRes.data ?? [],
  };
}

export interface HubBusinessResult {
  id: string;
  business_name: string;
  slug: string;
  tagline?: string;
  street_address?: string;
  city?: string;
  price_range?: string;
  tier?: string;
  logo?: string;
  latitude?: number;
  longitude?: number;
  neighborhood_id?: string;
  category_id?: string;
  created_at?: string;
  primary_image_url?: string;
  neighborhoods?: { name: string; slug: string } | null;
  categories?: { name: string; slug: string } | null;
}

export interface HubMapBusiness {
  id: string;
  business_name: string;
  slug: string;
  latitude: number;
  longitude: number;
  tier?: string;
}

export interface HubBusinessData {
  featured: HubBusinessResult[];
  grid: HubBusinessResult[];
  gridCount: number;
  map: HubMapBusiness[];
}

/**
 * Fetch featured, grid, and map businesses for a hub archive page.
 *
 * @param categoryIds — undefined = no category restriction (businesses page);
 *   non-empty array = restrict to these IDs; empty array = force no results.
 */
export async function getHubBusinesses(opts: {
  categoryIds?: string[];
  filters: {
    q?: string;
    category?: string;
    tier?: string;
    tag?: string;
    amenity?: string;
    identity?: string;
  };
  neighborhoodIds?: string[];
  categories: { id: string; slug: string }[];
  featuredLimit?: number;
  gridLimit?: number;
}): Promise<HubBusinessData> {
  const supabase = sb();
  const SELECT_COLS =
    "id, business_name, slug, tagline, street_address, city_id, price_range, tier, logo, latitude, longitude, neighborhood_id, category_id, created_at, neighborhoods(name, slug), categories(name, slug), cities(name)";
  const featuredLimit = opts.featuredLimit ?? 6;
  const gridLimit = opts.gridLimit ?? 12;

  /* ---------- Featured (Premium tier) ---------- */
  let featuredQuery = supabase
    .from("business_listings")
    .select(SELECT_COLS)
    .eq("status", "active")
    .eq("tier", "Premium")
    .order("created_at", { ascending: false })
    .limit(featuredLimit);

  if (opts.categoryIds !== undefined) {
    if (opts.categoryIds.length > 0) {
      featuredQuery = featuredQuery.in("category_id", opts.categoryIds);
    } else {
      featuredQuery = featuredQuery.in("category_id", ["__none__"]);
    }
  }
  if (opts.neighborhoodIds?.length) {
    featuredQuery = featuredQuery.in("neighborhood_id", opts.neighborhoodIds);
  }
  if (opts.filters.category) {
    const cat = opts.categories.find((c) => c.slug === opts.filters.category);
    if (cat) featuredQuery = featuredQuery.eq("category_id", cat.id);
  }

  const { data: rawFeatured } = await featuredQuery;
  const featuredIds = (rawFeatured ?? []).map((b: any) => b.id);

  /* Fetch primary images for featured */
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

  const featured: HubBusinessResult[] = (rawFeatured ?? []).map((b: any) => ({
    ...b,
    city: b.cities?.name ?? null,
    primary_image_url: featuredImages[b.id] || b.logo || null,
  }));

  /* ---------- Grid (active, dedup featured) ---------- */
  let gridQuery = supabase
    .from("business_listings")
    .select(SELECT_COLS, { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (opts.categoryIds !== undefined) {
    if (opts.categoryIds.length > 0) {
      gridQuery = gridQuery.in("category_id", opts.categoryIds);
    } else {
      gridQuery = gridQuery.in("category_id", ["__none__"]);
    }
  }
  if (featuredIds.length) {
    gridQuery = gridQuery.not("id", "in", `(${featuredIds.join(",")})`);
  }
  if (opts.neighborhoodIds?.length) {
    gridQuery = gridQuery.in("neighborhood_id", opts.neighborhoodIds);
  }
  if (opts.filters.category) {
    const cat = opts.categories.find((c) => c.slug === opts.filters.category);
    if (cat) gridQuery = gridQuery.eq("category_id", cat.id);
  }
  if (opts.filters.tier) {
    gridQuery = gridQuery.eq("tier", opts.filters.tier);
  }
  if (opts.filters.q) {
    gridQuery = gridQuery.or(
      `business_name.ilike.%${opts.filters.q}%,tagline.ilike.%${opts.filters.q}%,description.ilike.%${opts.filters.q}%,street_address.ilike.%${opts.filters.q}%`
    );
  }

  /* Tag filter via join table */
  if (opts.filters.tag) {
    const { data: taggedIds } = await supabase
      .from("business_tags")
      .select("business_id, tags!inner(slug)")
      .eq("tags.slug", opts.filters.tag);
    if (taggedIds?.length) {
      gridQuery = gridQuery.in(
        "id",
        taggedIds.map((t: any) => t.business_id)
      );
    } else {
      gridQuery = gridQuery.in("id", ["__none__"]);
    }
  }

  /* Amenity filter via join table */
  if (opts.filters.amenity) {
    const { data: amenityIds } = await supabase
      .from("business_amenities")
      .select("business_id, amenities!inner(slug)")
      .eq("amenities.slug", opts.filters.amenity);
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
  if (opts.filters.identity) {
    const { data: identityIds } = await supabase
      .from("business_identities")
      .select("business_id, business_identity_options!inner(slug)")
      .eq("business_identity_options.slug", opts.filters.identity);
    if (identityIds?.length) {
      gridQuery = gridQuery.in(
        "id",
        identityIds.map((i: any) => i.business_id)
      );
    } else {
      gridQuery = gridQuery.in("id", ["__none__"]);
    }
  }

  gridQuery = gridQuery
    .order("created_at", { ascending: false })
    .limit(gridLimit);

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

  const grid: HubBusinessResult[] = (rawGrid ?? []).map((b: any) => ({
    ...b,
    city: b.cities?.name ?? null,
    primary_image_url: gridImages[b.id] || b.logo || null,
  }));

  /* ---------- Map businesses ---------- */
  let mapQuery = supabase
    .from("business_listings")
    .select("id, business_name, slug, latitude, longitude, tier")
    .eq("status", "active")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (opts.categoryIds !== undefined) {
    if (opts.categoryIds.length > 0) {
      mapQuery = mapQuery.in("category_id", opts.categoryIds);
    } else {
      mapQuery = mapQuery.in("category_id", ["__none__"]);
    }
  }

  const { data: mapData } = await mapQuery;

  const map: HubMapBusiness[] = (mapData ?? []).map((b: any) => ({
    id: b.id,
    business_name: b.business_name,
    slug: b.slug,
    latitude: b.latitude,
    longitude: b.longitude,
    tier: b.tier,
  }));

  return { featured, grid, gridCount: gridCount ?? 0, map };
}

/* ============================================================
   BUSINESS DETAIL — shared queries for /places/[slug]
   and /things-to-do/[slug]
   ============================================================ */

/** Single business with full joins (neighborhood → area, category, city) */
export async function getBusinessDetailBySlug(slug: string): Promise<any | null> {
  const { data, error } = await sb()
    .from("business_listings")
    .select(`
      *,
      neighborhoods (
        id, name, slug, area_id,
        areas ( id, name, slug )
      ),
      categories ( id, name, slug ),
      cities ( name )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  return data;
}

/** All images for a business, ordered by sort_order */
export async function getBusinessImages(businessId: string): Promise<any[]> {
  const { data } = await sb()
    .from("business_images")
    .select("*")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

/** Operating hours for a business */
export async function getBusinessHours(businessId: string): Promise<any[]> {
  const { data } = await sb()
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId);
  return data ?? [];
}

/** Amenities linked to a business (names pre-mapped) */
export async function getBusinessAmenityLinks(businessId: string): Promise<{ id: string; name: string }[]> {
  const { data } = await sb()
    .from("business_amenities")
    .select("*, amenities ( id, name )")
    .eq("business_id", businessId);
  return (data ?? []).map((r: any) => r.amenities).filter(Boolean);
}

/** Tags linked to a business (names pre-mapped) */
export async function getBusinessTagLinks(businessId: string): Promise<{ id: string; name: string }[]> {
  const { data } = await sb()
    .from("business_tags")
    .select("*, tags ( id, name )")
    .eq("business_id", businessId);
  return (data ?? []).map((r: any) => r.tags).filter(Boolean);
}

/** Identity options linked to a business (names pre-mapped) */
export async function getBusinessIdentityLinks(businessId: string): Promise<{ id: string; name: string }[]> {
  const { data } = await sb()
    .from("business_identities")
    .select("*, business_identity_options ( id, name )")
    .eq("business_id", businessId);
  return (data ?? []).map((r: any) => r.business_identity_options).filter(Boolean);
}

/** Published reviews for a business */
export async function getApprovedReviews(businessId: string): Promise<any[]> {
  const { data } = await sb()
    .from("reviews")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("published_at", { ascending: false });
  return data ?? [];
}

/** Bulk primary images for a list of business IDs */
export async function getBusinessPrimaryImages(
  businessIds: string[]
): Promise<Record<string, string>> {
  if (!businessIds.length) return {};
  const { data } = await sb()
    .from("business_images")
    .select("business_id, image_url, is_primary, sort_order")
    .in("business_id", businessIds)
    .order("sort_order", { ascending: true });
  if (!data) return {};
  const map: Record<string, string> = {};
  for (const row of data as any[]) {
    if (!map[row.business_id] || row.is_primary) {
      map[row.business_id] = row.image_url;
    }
  }
  return map;
}

/**
 * Related businesses for detail page scrollers.
 * Strategy: same neighborhood → same category (or scoped categories) → newest.
 */
export async function getRelatedBusinesses(opts: {
  currentId: string;
  neighborhoodId: string | null;
  categoryId: string | null;
  scopeCategoryIds?: string[];
  limit?: number;
}): Promise<any[]> {
  const limit = opts.limit ?? 8;
  let results: any[] = [];
  const SELECT = "*, neighborhoods ( name, slug ), categories ( name, slug )";

  // 1. Same neighborhood first
  if (opts.neighborhoodId) {
    let q = sb()
      .from("business_listings")
      .select(SELECT)
      .eq("status", "active")
      .eq("neighborhood_id", opts.neighborhoodId)
      .neq("id", opts.currentId)
      .limit(limit);

    if (opts.scopeCategoryIds?.length) {
      q = q.in("category_id", opts.scopeCategoryIds);
    }

    const { data } = await q;
    if (data) results = data;
  }

  // 2. Backfill: same category (or scoped categories)
  if (results.length < limit) {
    const existingIds = results.map((r: any) => r.id);
    const idFilter = existingIds.length
      ? `(${existingIds.join(",")})`
      : "(__none__)";

    let q = sb()
      .from("business_listings")
      .select(SELECT)
      .eq("status", "active")
      .neq("id", opts.currentId)
      .not("id", "in", idFilter)
      .order("created_at", { ascending: false })
      .limit(limit - results.length);

    if (opts.scopeCategoryIds?.length) {
      q = q.in("category_id", opts.scopeCategoryIds);
    } else if (opts.categoryId) {
      q = q.eq("category_id", opts.categoryId);
    }

    const { data } = await q;
    if (data) results = [...results, ...data];
  }

  // 3. Backfill: newest active (no category filter, only for places page)
  if (results.length < limit && !opts.scopeCategoryIds?.length) {
    const existingIds = results.map((r: any) => r.id);
    const idFilter = existingIds.length
      ? `(${existingIds.join(",")})`
      : "(__none__)";

    const { data } = await sb()
      .from("business_listings")
      .select(SELECT)
      .eq("status", "active")
      .neq("id", opts.currentId)
      .not("id", "in", idFilter)
      .order("created_at", { ascending: false })
      .limit(limit - results.length);

    if (data) results = [...results, ...data];
  }

  // Deduplicate
  const seen = new Set<string>();
  return results.filter((r: any) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

/** Count active businesses grouped by neighborhood_id */
export async function getBusinessCountsByNeighborhood(
  neighborhoodIds?: string[]
): Promise<Record<string, number>> {
  let q = sb()
    .from("business_listings")
    .select("neighborhood_id")
    .eq("status", "active")
    .not("neighborhood_id", "is", null);

  if (neighborhoodIds?.length) {
    q = q.in("neighborhood_id", neighborhoodIds);
  }

  const { data } = await q.returns<{ neighborhood_id: string }[]>();
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.neighborhood_id] = (counts[row.neighborhood_id] ?? 0) + 1;
  }
  return counts;
}

/** Count published blog posts grouped by neighborhood_id */
export async function getStoryCountsByNeighborhood(): Promise<Record<string, number>> {
  const { data } = await sb()
    .from("blog_posts")
    .select("neighborhood_id")
    .eq("status", "published")
    .not("neighborhood_id", "is", null)
    .returns<{ neighborhood_id: string }[]>();

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.neighborhood_id] = (counts[row.neighborhood_id] ?? 0) + 1;
  }
  return counts;
}

/** Blog posts linked to a business via post_businesses join table */
export async function getLinkedBlogPosts(businessId: string, limit = 4): Promise<any[]> {
  const { data: links } = await sb()
    .from("post_businesses")
    .select("post_id")
    .eq("business_id", businessId)
    .returns<{ post_id: string }[]>();

  if (!links?.length) return [];

  const { data: posts } = await sb()
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image_url, published_at, categories ( name, slug )")
    .in("id", links.map((l) => l.post_id))
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  return posts ?? [];
}
