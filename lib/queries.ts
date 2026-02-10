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
  Amenity,
  IdentityOption,
  NeighborhoodGrouped,
} from "./types";

function sb() {
  return createServerClient();
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
  if (error) throw error;
  return data ?? [];
}

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const { data, error } = await sb()
    .from("areas")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") throw error;
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
  if (error) throw error;
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
  if (error && error.code !== "PGRST116") throw error;
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
  if (error) throw error;
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
  if (error && error.code !== "PGRST116") throw error;
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
  if (error && error.code !== "PGRST116") throw error;
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
  if (error) throw error;
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
  if (error && error.code !== "PGRST116") throw error;
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
    .select("*, neighborhoods(*), categories(*)")
    .in("id", bizIds)
    .eq("status", "active")
    .limit(limit);
  if (error) throw error;
  return (data as BusinessListingWithNeighborhood[]) ?? [];
}

/* ============================================================
   BUSINESS LISTINGS
   ============================================================ */

export async function getBusinesses(opts?: {
  search?: string;
  categoryId?: string;
  neighborhoodIds?: string[];
  featured?: boolean;
  limit?: number;
  status?: string;
}): Promise<BusinessListingWithNeighborhood[]> {
  let q = sb()
    .from("business_listings")
    .select("*, neighborhoods(*), categories(*)")
    .eq("status", opts?.status ?? "active")
    .order("is_featured", { ascending: false })
    .order("business_name");

  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.neighborhoodIds?.length)
    q = q.in("neighborhood_id", opts.neighborhoodIds);
  if (opts?.search)
    q = q.or(
      `business_name.ilike.%${opts.search}%,description.ilike.%${opts.search}%,tagline.ilike.%${opts.search}%`
    );
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data as BusinessListingWithNeighborhood[]) ?? [];
}

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessListingWithNeighborhood | null> {
  const { data, error } = await sb()
    .from("business_listings")
    .select("*, neighborhoods(*), categories(*)")
    .eq("slug", slug)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as BusinessListingWithNeighborhood | null;
}

/* ============================================================
   EVENTS
   ============================================================ */

export async function getEvents(opts?: {
  search?: string;
  categoryId?: string;
  neighborhoodIds?: string[];
  featured?: boolean;
  upcoming?: boolean;
  limit?: number;
  status?: string;
}): Promise<EventItemWithNeighborhood[]> {
  let q = sb()
    .from("events")
    .select("*, neighborhoods(*), categories(*)")
    .eq("status", opts?.status ?? "active")
    .order("start_date");

  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.upcoming) q = q.gte("start_date", new Date().toISOString().split("T")[0]);
  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.neighborhoodIds?.length)
    q = q.in("neighborhood_id", opts.neighborhoodIds);
  if (opts?.search)
    q = q.or(
      `title.ilike.%${opts.search}%,description.ilike.%${opts.search}%,venue_name.ilike.%${opts.search}%`
    );
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data as EventItemWithNeighborhood[]) ?? [];
}

export async function getEventBySlug(
  slug: string
): Promise<EventItemWithNeighborhood | null> {
  const { data, error } = await sb()
    .from("events")
    .select("*, neighborhoods(*), categories(*)")
    .eq("slug", slug)
    .single();
  if (error && error.code !== "PGRST116") throw error;
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
  if (error) throw error;
  return data ?? [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const { data, error } = await sb()
    .from("authors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") throw error;
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
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await sb()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/* ============================================================
   CITIES
   ============================================================ */

export async function getCities(opts?: {
  primary?: boolean;
}): Promise<City[]> {
  let q = sb()
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (opts?.primary) q = q.eq("is_primary", true);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
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
    .eq("status", opts?.status ?? "published")
    .order("published_at", { ascending: false });

  if (opts?.search) q = q.ilike("headline", `%${opts.search}%`);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
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
  if (error) throw error;
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
    .eq("status", "published")
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
  if (error) throw error;
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
  if (error && error.code !== "PGRST116") throw error;
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
  if (error) throw error;
  if (!data?.length) return [];

  const grouped = new Map<string, NeighborhoodGrouped>();
  for (const n of data) {
    const areaName = n.areas?.name ?? "Other";
    const areaSlug = n.areas?.slug ?? "other";
    if (!grouped.has(areaSlug)) {
      grouped.set(areaSlug, { area_name: areaName, area_slug: areaSlug, neighborhoods: [] });
    }
    grouped.get(areaSlug)!.neighborhoods.push({ id: n.id, name: n.name, slug: n.slug });
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
  if (error) throw error;
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
  if (error) throw error;
  return data ?? [];
}

/* ============================================================
   MEDIA ITEMS
   ============================================================ */

export async function getMediaItems(opts?: {
  limit?: number;
  featured?: boolean;
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

  if (opts?.featured) q = q.eq("is_featured", true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;

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
