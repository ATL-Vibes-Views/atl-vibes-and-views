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
  BusinessListing,
  BusinessListingWithNeighborhood,
  EventItem,
  EventItemWithNeighborhood,
  Author,
  Category,
  City,
  Story,
  NeighborhoodWithArea,
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
    .order("sort_order");
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
}): Promise<BlogPostWithAuthor[]> {
  let q = sb()
    .from("blog_posts")
    .select("*, authors(*), categories(*)")
    .eq("status", opts?.status ?? "published")
    .order("published_at", { ascending: false });

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
    .eq("status", opts?.status ?? "published")
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
