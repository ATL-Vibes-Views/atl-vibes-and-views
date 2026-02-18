/* ============================================================
   MAP CARD DATA — Server-side queries for MapInfoCard

   Called by page-level server components, NOT by the card itself.
   Data is pre-fetched and passed down as props.
   ============================================================ */

import { createServerClient } from '@/lib/supabase';

// Module-level singleton (same pattern as lib/queries.ts)
const _sb = createServerClient();
function sb() {
  return _sb;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AreaCardData {
  area: {
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    hero_image_url: string | null;
  };
  topNeighborhoods: Array<{
    name: string;
    slug: string;
    post_count: number;
  }>;
  featuredBusiness: {
    name: string;
    slug: string;
    featured_image_url: string | null;
    category_name: string;
  } | null;
}

export interface NeighborhoodCardData {
  neighborhood: {
    name: string;
    slug: string;
    tagline: string | null;
    hero_image_url: string | null;
    business_count: number;
    story_count: number;
  };
}

// ---------------------------------------------------------------------------
// Area card data
// ---------------------------------------------------------------------------

/**
 * Get area card data including top neighborhoods (by post count) and
 * a featured business for the ad placement slot.
 */
export async function getAreaCardData(
  areaId: string,
): Promise<AreaCardData | null> {
  // 1. Area details
  const { data: area, error: areaErr } = await sb()
    .from('areas')
    .select('name, slug, tagline, description, hero_image_url')
    .eq('id', areaId)
    .eq('is_active', true)
    .single();

  if (areaErr || !area) return null;

  // 2. Get neighborhoods in this area
  const { data: neighborhoods } = await sb()
    .from('neighborhoods')
    .select('id, name, slug')
    .eq('area_id', areaId)
    .eq('is_active', true);

  const nbrList = (neighborhoods ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  // 3. Top 3 neighborhoods by blog post count
  const topNeighborhoods: AreaCardData['topNeighborhoods'] = [];

  if (nbrList.length > 0) {
    const nbrIds = nbrList.map((n) => n.id);

    // Get all post_neighborhoods links for these neighborhoods where post is published
    const { data: postLinks } = await sb()
      .from('post_neighborhoods')
      .select('neighborhood_id')
      .in('neighborhood_id', nbrIds);

    // We need to check which posts are actually published — fetch those post IDs
    // Since we can't easily do a join with the typed client, get post_neighborhoods
    // and then verify posts
    const linkRows = (postLinks ?? []) as Array<{ neighborhood_id: string }>;

    // Tally counts per neighborhood
    const counts: Record<string, number> = {};
    for (const link of linkRows) {
      counts[link.neighborhood_id] = (counts[link.neighborhood_id] ?? 0) + 1;
    }

    // Merge counts, sort, take top 3
    const ranked = nbrList
      .map((n) => ({
        name: n.name,
        slug: n.slug,
        post_count: counts[n.id] ?? 0,
      }))
      .sort((a, b) => b.post_count - a.post_count)
      .slice(0, 3);

    topNeighborhoods.push(...ranked);
  }

  // 4. Featured business — highest-tier active business in area
  let featuredBusiness: AreaCardData['featuredBusiness'] = null;

  if (nbrList.length > 0) {
    const nbrIds = nbrList.map((n) => n.id);

    const { data: bizRows } = await sb()
      .from('business_listings')
      .select('business_name, slug, logo, category_id')
      .in('neighborhood_id', nbrIds)
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    const biz = (bizRows as Array<{
      business_name: string;
      slug: string;
      logo: string | null;
      category_id: string | null;
    }> | null)?.[0];

    if (biz) {
      // Look up category name
      let categoryName = '';
      if (biz.category_id) {
        const { data: cat } = await sb()
          .from('categories')
          .select('name')
          .eq('id', biz.category_id)
          .single();
        categoryName = (cat as { name: string } | null)?.name ?? '';
      }

      featuredBusiness = {
        name: biz.business_name,
        slug: biz.slug,
        featured_image_url: biz.logo,
        category_name: categoryName,
      };
    }
  }

  return {
    area: area as AreaCardData['area'],
    topNeighborhoods,
    featuredBusiness,
  };
}

// ---------------------------------------------------------------------------
// Bulk area card data (for pre-fetching all 9 areas)
// ---------------------------------------------------------------------------

/**
 * Pre-fetch card data for multiple areas at once. Returns a map keyed by
 * area slug for instant lookup on polygon click.
 */
export async function getAllAreaCardData(): Promise<
  Record<string, AreaCardData>
> {
  const { data: areas } = await sb()
    .from('areas')
    .select('id, slug')
    .eq('is_active', true);

  const areaList = (areas ?? []) as Array<{ id: string; slug: string }>;
  if (areaList.length === 0) return {};

  const result: Record<string, AreaCardData> = {};

  // Fetch in parallel
  const entries = await Promise.all(
    areaList.map(async (a) => {
      const data = await getAreaCardData(a.id);
      return { slug: a.slug, data };
    }),
  );

  for (const entry of entries) {
    if (entry.data) result[entry.slug] = entry.data;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Neighborhood card data
// ---------------------------------------------------------------------------

/**
 * Get neighborhood card data with business and story counts.
 */
export async function getNeighborhoodCardData(
  neighborhoodId: string,
): Promise<NeighborhoodCardData | null> {
  // 1. Neighborhood details
  const { data: nbr, error: nbrErr } = await sb()
    .from('neighborhoods')
    .select('name, slug, tagline, hero_image_url')
    .eq('id', neighborhoodId)
    .eq('is_active', true)
    .single();

  if (nbrErr || !nbr) return null;

  // 2. Count active businesses
  const { count: businessCount } = await sb()
    .from('business_listings')
    .select('id', { count: 'exact', head: true })
    .eq('neighborhood_id', neighborhoodId)
    .eq('status', 'active');

  // 3. Count post_neighborhoods rows (approximation for story count)
  const { count: storyCount } = await sb()
    .from('post_neighborhoods')
    .select('id', { count: 'exact', head: true })
    .eq('neighborhood_id', neighborhoodId);

  const nbrData = nbr as {
    name: string;
    slug: string;
    tagline: string | null;
    hero_image_url: string | null;
  };

  return {
    neighborhood: {
      ...nbrData,
      business_count: businessCount ?? 0,
      story_count: storyCount ?? 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Bulk neighborhood card data (for pre-fetching all neighborhoods in an area)
// ---------------------------------------------------------------------------

/**
 * Pre-fetch card data for all neighborhoods in an area. Returns a map keyed
 * by neighborhood slug.
 */
export async function getNeighborhoodCardDataForArea(
  areaId: string,
): Promise<Record<string, NeighborhoodCardData>> {
  const { data: neighborhoods } = await sb()
    .from('neighborhoods')
    .select('id, slug')
    .eq('area_id', areaId)
    .eq('is_active', true);

  const nbrList = (neighborhoods ?? []) as Array<{
    id: string;
    slug: string;
  }>;
  if (nbrList.length === 0) return {};

  const result: Record<string, NeighborhoodCardData> = {};

  const entries = await Promise.all(
    nbrList.map(async (n) => {
      const data = await getNeighborhoodCardData(n.id);
      return { slug: n.slug, data };
    }),
  );

  for (const entry of entries) {
    if (entry.data) result[entry.slug] = entry.data;
  }

  return result;
}

// ---------------------------------------------------------------------------
// SQL for ad_placements (run manually by Mellanda)
// ---------------------------------------------------------------------------
//
// INSERT INTO ad_placements (name, channel, placement_key, page_type, dimensions, description, is_active)
// VALUES (
//   'Map Area Card - Featured Business',
//   'web',
//   'map_area_card_featured',
//   'all',
//   '48x48 thumb + text',
//   'Featured business slot in the map slide-out card when user clicks an area polygon. Shows business thumbnail, name, and category.',
//   true
// );
