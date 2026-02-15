# Ad Placement Inventory

**Generated:** 2026-02-15
**Supabase Project:** qthjasdenjuwbvvomvdk

---

## Section 1: Summary Stats

| Metric | Count |
|--------|-------|
| Total placement slots found | 28 |
| Total unique pages with ads | 8 |
| Total template pages with ads | 9 |
| Total shared components with ads | 6 |
| Total ad_placements rows to seed | 28 |
| Locked pages skipped | 4 files (6 placements) |
| Replacements completed | 22 |

---

## Section 2: Full Inventory Table

| # | placement_key | Page Type | Route | Zone | Position | Variant | File Path | Status |
|---|--------------|-----------|-------|------|----------|---------|-----------|--------|
| 1 | HOME_SIDEBAR_01 | homepage | / | sidebar | 01 | sidebar | app/(public)/page.tsx | LOCKED |
| 2 | NEIGHBORHOODS_LANDING_INLINE_01 | neighborhoods_landing | /neighborhoods | inline | 01 | inline | app/(public)/neighborhoods/page.tsx | Replaced |
| 3 | NEIGHBORHOODS_LANDING_SIDEBAR_01 | neighborhoods_landing | /neighborhoods | sidebar | 01 | sidebar | app/(public)/neighborhoods/page.tsx | Replaced |
| 4 | BUSINESSES_SIDEBAR_01 | businesses_hub | /hub/businesses | sidebar | 01 | sidebar | app/(public)/hub/businesses/page.tsx | Replaced |
| 5 | EATS_SIDEBAR_01 | eats_drinks | /hub/eats-and-drinks | sidebar | 01 | sidebar | app/(public)/hub/eats-and-drinks/page.tsx | Replaced |
| 6 | THINGSTODO_SIDEBAR_01 | things_to_do_hub | /hub/things-to-do | sidebar | 01 | sidebar | app/(public)/hub/things-to-do/page.tsx | Replaced |
| 7 | EVENTS_SIDEBAR_01 | events_archive | /hub/events | sidebar | 01 | sidebar | app/(public)/hub/events/page.tsx | LOCKED |
| 8 | EVENTS_INLINE_01 | events_archive | /hub/events | inline | 01 | inline | app/(public)/hub/events/EventsClient.tsx | LOCKED |
| 9 | AREA_INLINE_01 | area_detail | /areas/[slug] | inline | 01 | inline | app/(public)/areas/[slug]/page.tsx | Replaced |
| 10 | AREA_SIDEBAR_01 | area_detail | /areas/[slug] | sidebar | 01 | sidebar | app/(public)/areas/[slug]/page.tsx | Replaced |
| 11 | NEIGHBORHOOD_INLINE_01 | neighborhood_detail | /neighborhoods/[slug] | inline | 01 | inline | components/LocationDetailContent.tsx | Replaced |
| 12 | NEIGHBORHOOD_SIDEBAR_01 | neighborhood_detail | /neighborhoods/[slug] | sidebar | 01 | sidebar | components/LocationDetailContent.tsx | Replaced |
| 13 | CITY_INLINE_01 | city_detail | /beyond-atl/[slug] | inline | 01 | inline | components/LocationDetailContent.tsx | Replaced |
| 14 | CITY_SIDEBAR_01 | city_detail | /beyond-atl/[slug] | sidebar | 01 | sidebar | components/LocationDetailContent.tsx | Replaced |
| 15 | BLOG_SIDEBAR_01 | blog_detail | /stories/[slug] | sidebar | 01 | sidebar | app/(public)/stories/[slug]/page.tsx | LOCKED |
| 16 | BLOG_SIDEBAR_02 | blog_detail | /stories/[slug] | sidebar | 02 | sidebar | app/(public)/stories/[slug]/page.tsx | LOCKED |
| 17 | BLOG_SIDEBAR_03 | blog_detail | /stories/[slug] | sidebar | 03 | sidebar | app/(public)/stories/[slug]/page.tsx | LOCKED |
| 18 | MEDIA_DETAIL_SIDEBAR_01 | media_detail | /media/[slug] | sidebar | 01 | sidebar | app/(public)/media/[slug]/page.tsx | Replaced |
| 19 | NEWSLETTER_DETAIL_SIDEBAR_01 | newsletter | /newsletters/[slug] | sidebar | 01 | sidebar | app/(public)/newsletters/[slug]/page.tsx | Replaced |
| 20 | AREAS_LANDING_SIDEBAR_01 | areas_landing | /areas | sidebar | 01 | sidebar | components/AreaLandingContent.tsx | Replaced |
| 21 | AREAS_LANDING_SIDEBAR_02 | areas_landing | /areas | sidebar | 02 | sidebar | components/AreaLandingContent.tsx | Replaced |
| 22 | STORIES_INLINE_01 | stories_archive | /stories | inline | 01 | inline | components/StoriesArchiveClient.tsx | Replaced |
| 23 | HUB_INLINE_01 | businesses_hub | /hub/* | inline | 01 | inline | components/HubArchiveClient.tsx | Replaced |
| 24 | HUB_HORIZONTAL_01 | businesses_hub | /hub/* | footer | 01 | horizontal | components/HubArchiveClient.tsx | Replaced |
| 25 | MEDIA_LANDING_INLINE_01 | media_landing | /media | inline | 01 | inline | app/(public)/media/MediaLandingClient.tsx | Replaced |
| 26 | MEDIA_LIBRARY_INLINE_01 | media_library | /media/library | inline | 01 | inline | components/MediaLibraryClient.tsx | Replaced |
| 27 | NEWSLETTER_SIDEBAR_01 | newsletter | /newsletters | sidebar | 01 | sidebar | components/newsletter/NewsletterSidebar.tsx | Replaced |
| 28 | NEWSLETTER_INLINE_01 | newsletter | /newsletters | inline | 01 | inline | components/newsletter/NewsletterArchiveClient.tsx | Replaced |

---

## Section 3: Full Inventory (CSV)

```csv
#,placement_key,page_type,route,zone,position,variant,file_path,status
1,HOME_SIDEBAR_01,homepage,/,sidebar,01,sidebar,app/(public)/page.tsx,LOCKED
2,NEIGHBORHOODS_LANDING_INLINE_01,neighborhoods_landing,/neighborhoods,inline,01,inline,app/(public)/neighborhoods/page.tsx,Replaced
3,NEIGHBORHOODS_LANDING_SIDEBAR_01,neighborhoods_landing,/neighborhoods,sidebar,01,sidebar,app/(public)/neighborhoods/page.tsx,Replaced
4,BUSINESSES_SIDEBAR_01,businesses_hub,/hub/businesses,sidebar,01,sidebar,app/(public)/hub/businesses/page.tsx,Replaced
5,EATS_SIDEBAR_01,eats_drinks,/hub/eats-and-drinks,sidebar,01,sidebar,app/(public)/hub/eats-and-drinks/page.tsx,Replaced
6,THINGSTODO_SIDEBAR_01,things_to_do_hub,/hub/things-to-do,sidebar,01,sidebar,app/(public)/hub/things-to-do/page.tsx,Replaced
7,EVENTS_SIDEBAR_01,events_archive,/hub/events,sidebar,01,sidebar,app/(public)/hub/events/page.tsx,LOCKED
8,EVENTS_INLINE_01,events_archive,/hub/events,inline,01,inline,app/(public)/hub/events/EventsClient.tsx,LOCKED
9,AREA_INLINE_01,area_detail,/areas/[slug],inline,01,inline,app/(public)/areas/[slug]/page.tsx,Replaced
10,AREA_SIDEBAR_01,area_detail,/areas/[slug],sidebar,01,sidebar,app/(public)/areas/[slug]/page.tsx,Replaced
11,NEIGHBORHOOD_INLINE_01,neighborhood_detail,/neighborhoods/[slug],inline,01,inline,components/LocationDetailContent.tsx,Replaced
12,NEIGHBORHOOD_SIDEBAR_01,neighborhood_detail,/neighborhoods/[slug],sidebar,01,sidebar,components/LocationDetailContent.tsx,Replaced
13,CITY_INLINE_01,city_detail,/beyond-atl/[slug],inline,01,inline,components/LocationDetailContent.tsx,Replaced
14,CITY_SIDEBAR_01,city_detail,/beyond-atl/[slug],sidebar,01,sidebar,components/LocationDetailContent.tsx,Replaced
15,BLOG_SIDEBAR_01,blog_detail,/stories/[slug],sidebar,01,sidebar,app/(public)/stories/[slug]/page.tsx,LOCKED
16,BLOG_SIDEBAR_02,blog_detail,/stories/[slug],sidebar,02,sidebar,app/(public)/stories/[slug]/page.tsx,LOCKED
17,BLOG_SIDEBAR_03,blog_detail,/stories/[slug],sidebar,03,sidebar,app/(public)/stories/[slug]/page.tsx,LOCKED
18,MEDIA_DETAIL_SIDEBAR_01,media_detail,/media/[slug],sidebar,01,sidebar,app/(public)/media/[slug]/page.tsx,Replaced
19,NEWSLETTER_DETAIL_SIDEBAR_01,newsletter,/newsletters/[slug],sidebar,01,sidebar,app/(public)/newsletters/[slug]/page.tsx,Replaced
20,AREAS_LANDING_SIDEBAR_01,areas_landing,/areas,sidebar,01,sidebar,components/AreaLandingContent.tsx,Replaced
21,AREAS_LANDING_SIDEBAR_02,areas_landing,/areas,sidebar,02,sidebar,components/AreaLandingContent.tsx,Replaced
22,STORIES_INLINE_01,stories_archive,/stories,inline,01,inline,components/StoriesArchiveClient.tsx,Replaced
23,HUB_INLINE_01,businesses_hub,/hub/*,inline,01,inline,components/HubArchiveClient.tsx,Replaced
24,HUB_HORIZONTAL_01,businesses_hub,/hub/*,footer,01,horizontal,components/HubArchiveClient.tsx,Replaced
25,MEDIA_LANDING_INLINE_01,media_landing,/media,inline,01,inline,app/(public)/media/MediaLandingClient.tsx,Replaced
26,MEDIA_LIBRARY_INLINE_01,media_library,/media/library,inline,01,inline,components/MediaLibraryClient.tsx,Replaced
27,NEWSLETTER_SIDEBAR_01,newsletter,/newsletters,sidebar,01,sidebar,components/newsletter/NewsletterSidebar.tsx,Replaced
28,NEWSLETTER_INLINE_01,newsletter,/newsletters,inline,01,inline,components/newsletter/NewsletterArchiveClient.tsx,Replaced
```

---

## Section 4: SQL Statements

### Step 1 — Add Targeting Columns to ad_flights

```sql
-- Add targeting columns to ad_flights
ALTER TABLE ad_flights ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id);
ALTER TABLE ad_flights ADD COLUMN IF NOT EXISTS neighborhood_id uuid REFERENCES neighborhoods(id);
ALTER TABLE ad_flights ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

-- Add index for targeting lookups
CREATE INDEX IF NOT EXISTS idx_ad_flights_area ON ad_flights(area_id);
CREATE INDEX IF NOT EXISTS idx_ad_flights_neighborhood ON ad_flights(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_ad_flights_category ON ad_flights(category_id);

-- Add index for active flight lookups
CREATE INDEX IF NOT EXISTS idx_ad_flights_active ON ad_flights(placement_id, status, start_date, end_date);
```

### Step 2 — Create RPC Function

```sql
CREATE OR REPLACE FUNCTION get_active_ad(
  p_placement_key TEXT,
  p_neighborhood_id UUID DEFAULT NULL,
  p_area_id UUID DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
  flight_id UUID,
  creative_type TEXT,
  headline VARCHAR,
  body VARCHAR,
  cta_text VARCHAR,
  target_url TEXT,
  image_url TEXT,
  alt_text TEXT,
  utm_campaign TEXT,
  utm_source TEXT,
  utm_medium TEXT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    f.id as flight_id,
    c.creative_type,
    c.headline,
    c.body,
    c.cta_text,
    c.target_url,
    c.image_url,
    c.alt_text,
    c.utm_campaign,
    c.utm_source,
    c.utm_medium
  FROM ad_flights f
  JOIN ad_placements p ON f.placement_id = p.id
  JOIN ad_creatives c ON f.creative_id = c.id
  WHERE p.placement_key = p_placement_key
    AND p.is_active = true
    AND f.status = 'active'
    AND f.start_date <= CURRENT_DATE
    AND f.end_date >= CURRENT_DATE
    AND c.is_active = true
    AND (f.neighborhood_id IS NULL OR f.neighborhood_id = p_neighborhood_id)
    AND (f.area_id IS NULL OR f.area_id = p_area_id)
    AND (f.category_id IS NULL OR f.category_id = p_category_id)
  ORDER BY f.priority ASC
  LIMIT 1;
$$;
```

### Step 3 — Seed ad_placements Table

```sql
-- Check for existing rows first
-- SELECT placement_key FROM ad_placements;

INSERT INTO ad_placements (id, name, channel, placement_key, page_type, dimensions, description, is_active, created_at)
VALUES
  (gen_random_uuid(), 'Homepage Sidebar Top', 'website', 'HOME_SIDEBAR_01', 'homepage', '300x250', 'Right sidebar, next to Editor''s Picks section', true, NOW()),
  (gen_random_uuid(), 'Neighborhoods Landing Inline', 'website', 'NEIGHBORHOODS_LANDING_INLINE_01', 'neighborhoods_landing', NULL, 'Full-width horizontal ad between Discover section and Video module', true, NOW()),
  (gen_random_uuid(), 'Neighborhoods Landing Sidebar', 'website', 'NEIGHBORHOODS_LANDING_SIDEBAR_01', 'neighborhoods_landing', '300x600', 'Sidebar fallback when no featured business exists', true, NOW()),
  (gen_random_uuid(), 'Businesses Hub Sidebar', 'website', 'BUSINESSES_SIDEBAR_01', 'businesses_hub', '300x250', 'Right sidebar bottom, sticky position', true, NOW()),
  (gen_random_uuid(), 'Eats & Drinks Sidebar', 'website', 'EATS_SIDEBAR_01', 'eats_drinks', '300x250', 'Right sidebar bottom, sticky position', true, NOW()),
  (gen_random_uuid(), 'Things To Do Sidebar', 'website', 'THINGSTODO_SIDEBAR_01', 'things_to_do_hub', '300x250', 'Right sidebar bottom, sticky position', true, NOW()),
  (gen_random_uuid(), 'Events Archive Sidebar', 'website', 'EVENTS_SIDEBAR_01', 'events_archive', '300x250', 'Right sidebar, inside SidebarWidget', true, NOW()),
  (gen_random_uuid(), 'Events Archive Inline', 'website', 'EVENTS_INLINE_01', 'events_archive', '728x90', 'Full-width horizontal banner in event grid', true, NOW()),
  (gen_random_uuid(), 'Area Detail Inline', 'website', 'AREA_INLINE_01', 'area_detail', NULL, 'Full-width inline between Stories and Eats sections', true, NOW()),
  (gen_random_uuid(), 'Area Detail Sidebar', 'website', 'AREA_SIDEBAR_01', 'area_detail', '300x250', 'Right sidebar after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'Neighborhood Detail Inline', 'website', 'NEIGHBORHOOD_INLINE_01', 'neighborhood_detail', NULL, 'Inline ad between stories and eats sections', true, NOW()),
  (gen_random_uuid(), 'Neighborhood Detail Sidebar', 'website', 'NEIGHBORHOOD_SIDEBAR_01', 'neighborhood_detail', '300x250', 'Right sidebar after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'City Detail Inline', 'website', 'CITY_INLINE_01', 'city_detail', NULL, 'Inline ad between stories and eats sections (Beyond ATL)', true, NOW()),
  (gen_random_uuid(), 'City Detail Sidebar', 'website', 'CITY_SIDEBAR_01', 'city_detail', '300x250', 'Right sidebar after Newsletter widget (Beyond ATL)', true, NOW()),
  (gen_random_uuid(), 'Blog Post Sidebar 1', 'website', 'BLOG_SIDEBAR_01', 'blog_detail', '300x250', 'News sidebar after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'Blog Post Sidebar 2', 'website', 'BLOG_SIDEBAR_02', 'blog_detail', '300x250', 'Guide sidebar after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'Blog Post Sidebar 3', 'website', 'BLOG_SIDEBAR_03', 'blog_detail', '300x250', 'Directory sidebar after SubmitEventCTA', true, NOW()),
  (gen_random_uuid(), 'Media Detail Sidebar', 'website', 'MEDIA_DETAIL_SIDEBAR_01', 'media_detail', '300x250', 'Right sidebar after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'Newsletter Detail Sidebar', 'website', 'NEWSLETTER_DETAIL_SIDEBAR_01', 'newsletter', '300x250', 'Right sidebar after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'Areas Landing Sidebar Top', 'website', 'AREAS_LANDING_SIDEBAR_01', 'areas_landing', '300x250', 'Sidebar top after Newsletter widget', true, NOW()),
  (gen_random_uuid(), 'Areas Landing Sidebar Bottom', 'website', 'AREAS_LANDING_SIDEBAR_02', 'areas_landing', '300x250', 'Sidebar bottom after Events widget', true, NOW()),
  (gen_random_uuid(), 'Stories Archive Inline', 'website', 'STORIES_INLINE_01', 'stories_archive', NULL, 'Inline banner after every 8th story card', true, NOW()),
  (gen_random_uuid(), 'Hub Archive Inline (Mobile)', 'website', 'HUB_INLINE_01', 'businesses_hub', NULL, 'Mobile-only inline ad after 12th card in hub grid', true, NOW()),
  (gen_random_uuid(), 'Hub Archive Horizontal', 'website', 'HUB_HORIZONTAL_01', 'businesses_hub', '728x120', 'Full-width horizontal ad between grid and newsletter', true, NOW()),
  (gen_random_uuid(), 'Media Landing Inline', 'website', 'MEDIA_LANDING_INLINE_01', 'media_landing', NULL, 'Inline ad after every 8th media item', true, NOW()),
  (gen_random_uuid(), 'Media Library Inline', 'website', 'MEDIA_LIBRARY_INLINE_01', 'media_library', NULL, 'Inline ad between Videos grid and Shorts section', true, NOW()),
  (gen_random_uuid(), 'Newsletter Archive Sidebar', 'newsletter', 'NEWSLETTER_SIDEBAR_01', 'newsletter', '300x600', 'Desktop sidebar 300x600 vertical ad', true, NOW()),
  (gen_random_uuid(), 'Newsletter Archive Inline', 'newsletter', 'NEWSLETTER_INLINE_01', 'newsletter', '728x90', 'Horizontal ad divider between newsletter zones', true, NOW()),
  (gen_random_uuid(), 'Global Default Sidebar', 'website', 'GLOBAL_SIDEBAR_01', 'global', '300x250', 'Default sidebar ad when no specific sidebar children provided', true, NOW())
ON CONFLICT DO NOTHING;
```

---

## Section 5: Locked Page Integration Guide

### 1. Homepage (`app/(public)/page.tsx`) - HOME_SIDEBAR_01

**Current code (line ~311):**
```tsx
<AdPlacement slot="sidebar_top" />
```

**Required change:**
```tsx
// Add import at top of file:
import ServerAdPlacement from "@/components/ads/AdPlacement";

// Replace line 311:
<ServerAdPlacement placementKey="HOME_SIDEBAR_01" variant="sidebar" />

// Remove AdPlacement from Sidebar import
```

### 2. Events Archive (`app/(public)/hub/events/page.tsx`) - EVENTS_SIDEBAR_01

**Current code (lines 178-186):**
```tsx
<div className="flex items-center justify-center h-[250px] text-center">
  <div>
    <p className="text-xs text-gray-400 font-semibold uppercase tracking-[0.1em]">
      Advertisement
    </p>
    <p className="text-[10px] text-gray-300 mt-1">300 x 250</p>
  </div>
</div>
```

**Required change:**
```tsx
// Add import at top of file:
import ServerAdPlacement from "@/components/ads/AdPlacement";

// Replace lines 178-186 with:
<ServerAdPlacement placementKey="EVENTS_SIDEBAR_01" variant="sidebar" />
```

### 3. Events Client (`app/(public)/hub/events/EventsClient.tsx`) - EVENTS_INLINE_01

**Current code (lines 525-531):**
```tsx
<div className="bg-gray-50 border border-gray-200 flex items-center justify-center h-[90px] md:h-[120px]">
  <div className="text-center">
    <p className="text-xs text-gray-400 font-semibold uppercase tracking-[0.1em]">
      Advertisement
    </p>
    <p className="text-[10px] text-gray-300 mt-1">728 x 90</p>
  </div>
</div>
```

**Required change:**
```tsx
// Add import at top of file:
import { AdPlacementClient } from "@/components/ads/AdPlacementClient";

// Replace with:
<AdPlacementClient placementKey="EVENTS_INLINE_01" variant="inline" />
```

### 4. Blog Post Detail (`app/(public)/stories/[slug]/page.tsx`) - BLOG_SIDEBAR_01/02/03

**Current code:**
- Line ~456: `<AdPlacement slot="sidebar_top" />` (NewsSidebar)
- Line ~553: `<AdPlacement slot="sidebar_top" />` (GuideSidebar)
- Line ~653: `<AdPlacement slot="sidebar_mid" />` (DirectorySidebar)

**Required changes:**
```tsx
// Add import at top of file:
import ServerAdPlacement from "@/components/ads/AdPlacement";

// Line ~456: Replace with:
<ServerAdPlacement placementKey="BLOG_SIDEBAR_01" variant="sidebar" categoryId={post.category_id} />

// Line ~553: Replace with:
<ServerAdPlacement placementKey="BLOG_SIDEBAR_02" variant="sidebar" categoryId={post.category_id} />

// Line ~653: Replace with:
<ServerAdPlacement placementKey="BLOG_SIDEBAR_03" variant="sidebar" categoryId={post.category_id} />

// Remove AdPlacement from Sidebar import
```

---

## Section 6: Component Usage Reference

### Server Component Usage (pages + server components)

```tsx
import ServerAdPlacement from "@/components/ads/AdPlacement";

// Basic usage (no targeting):
<ServerAdPlacement placementKey="HOME_SIDEBAR_01" variant="sidebar" />

// With targeting context:
<ServerAdPlacement
  placementKey="NEIGHBORHOOD_SIDEBAR_01"
  variant="sidebar"
  neighborhoodId={neighborhood.id}
  areaId={neighborhood.area_id}
/>

// Inline variant:
<ServerAdPlacement placementKey="AREA_INLINE_01" variant="inline" areaId={area.id} />

// Horizontal variant:
<ServerAdPlacement placementKey="HUB_HORIZONTAL_01" variant="horizontal" />
```

### Client Component Usage ("use client" files)

```tsx
import { AdPlacementClient } from "@/components/ads/AdPlacementClient";

// Basic usage:
<AdPlacementClient placementKey="STORIES_INLINE_01" variant="inline" />

// With targeting:
<AdPlacementClient
  placementKey="NEIGHBORHOOD_SIDEBAR_01"
  variant="sidebar"
  neighborhoodId={neighborhoodId}
  areaId={areaId}
/>
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| placementKey | string | required | Deterministic key matching ad_placements.placement_key |
| variant | "sidebar" \| "inline" \| "horizontal" | "sidebar" | Visual layout variant |
| className | string | "" | Additional CSS classes |
| neighborhoodId | string | undefined | Target ads to specific neighborhood |
| areaId | string | undefined | Target ads to specific area |
| categoryId | string | undefined | Target ads to specific category |

### Targeting Logic

The `get_active_ad` RPC function matches flights using nullable targeting:
- `flight.neighborhood_id IS NULL` = shows on ALL neighborhoods
- `flight.neighborhood_id = page_neighborhood_id` = shows only on that neighborhood
- Same logic for area_id and category_id
- All three conditions are ANDed together
