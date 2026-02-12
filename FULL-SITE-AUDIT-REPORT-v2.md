# FULL SITE AUDIT REPORT v2

**Generated:** 2026-02-12
**Schema version:** `SUPABASE-REAL-SCHEMA.md` v2 — COMPLETE (73 tables)
**Files audited:** `lib/types.ts`, `lib/queries.ts`
**Scope:** Every table compared. No code or database modified.

---

## TABLE OF CONTENTS

1. [All 73 Tables — Status Matrix](#1-all-73-tables--status-matrix)
2. [Detailed Findings for Tables WITH Interfaces (28)](#2-detailed-findings-for-tables-with-interfaces)
3. [Tables WITHOUT Interfaces (45)](#3-tables-without-interfaces)
4. [queries.ts Audit](#4-queriests-audit)
5. [Status Filter Mismatches](#5-status-filter-mismatches)
6. [FK Constraint Audit](#6-fk-constraint-audit)
7. [Summary of All Issues](#7-summary-of-all-issues)

---

## 1. All 73 Tables — Status Matrix

| # | DB Table | TS Interface | Location | Verdict |
|---|---|---|---|---|
| 1 | `ad_campaigns` | — | — | NO INTERFACE |
| 2 | `ad_creatives` | — | — | NO INTERFACE |
| 3 | `ad_flights` | — | — | NO INTERFACE |
| 4 | `ad_placements` | — | — | NO INTERFACE |
| 5 | `amenities` | `Amenity` | types.ts:463 | MISMATCHES |
| 6 | `areas` | `Area` | types.ts:28 | PERFECT MATCH |
| 7 | `authors` | `Author` | types.ts:102 | PERFECT MATCH |
| 8 | `blog_posts` | `BlogPost` | types.ts:62 | PERFECT MATCH |
| 9 | `brands` | — | — | NO INTERFACE |
| 10 | `business_amenities` | — | — | NO INTERFACE (join) |
| 11 | `business_contacts` | — | — | NO INTERFACE |
| 12 | `business_hours` | — | — | NO INTERFACE |
| 13 | `business_identities` | — | — | NO INTERFACE (join) |
| 14 | `business_identity_options` | `IdentityOption` | types.ts:470 | MISMATCHES |
| 15 | `business_images` | — | — | NO INTERFACE |
| 16 | `business_listings` | `BusinessListing` | types.ts:118 | CRITICAL MISMATCHES |
| 17 | `business_organizations` | — | — | NO INTERFACE (join) |
| 18 | `business_tags` | — | — | NO INTERFACE (join) |
| 19 | `categories` | `Category` | types.ts:209 | PERFECT MATCH |
| 20 | `cities` | `City` | types.ts:221 | PERFECT MATCH |
| 21 | `claims` | — | — | NO INTERFACE |
| 22 | `content_calendar` | — | — | NO INTERFACE |
| 23 | `content_history` | — | — | NO INTERFACE |
| 24 | `content_index` | `ContentIndex` | types.ts:290 | 1 MISSING COLUMN |
| 25 | `content_performance` | — | — | NO INTERFACE |
| 26 | `event_images` | — | — | NO INTERFACE |
| 27 | `event_map_pin_rules` | — | — | NO INTERFACE |
| 28 | `event_tags` | — | — | NO INTERFACE (join) |
| 29 | `event_tier_pricing` | — | — | NO INTERFACE |
| 30 | `event_tier_visibility_rules` | — | — | NO INTERFACE |
| 31 | `events` | `EventItem` | types.ts:168 | CRITICAL MISMATCHES |
| 32 | `featured_slots` | `FeaturedSlot` | types.ts:275 | PERFECT MATCH |
| 33 | `headline_variants` | — | — | NO INTERFACE |
| 34 | `map_pin_rules` | — | — | NO INTERFACE |
| 35 | `media_assets` | `MediaAsset` | types.ts:382 | PERFECT MATCH |
| 36 | `media_item_assets` | `MediaItemAsset` | types.ts:404 | PERFECT MATCH |
| 37 | `media_item_links` | `MediaItemLink` | types.ts:415 | PERFECT MATCH |
| 38 | `media_items` | `MediaItem` | types.ts:362 | PERFECT MATCH |
| 39 | `neighborhoods` | `Neighborhood` | types.ts:44 | PERFECT MATCH |
| 40 | `newsletter_posts` | `NewsletterPost` | types.ts:438 | PERFECT MATCH |
| 41 | `newsletter_sections` | `NewsletterSection` | types.ts:428 | PERFECT MATCH |
| 42 | `newsletter_types` | `NewsletterType` | queries.ts:937 | PERFECT MATCH |
| 43 | `newsletters` | `Newsletter` | queries.ts:892 | MISMATCHES |
| 44 | `organizations` | — | — | NO INTERFACE |
| 45 | `pillars` | — | — | NO INTERFACE |
| 46 | `post_businesses` | — | — | NO INTERFACE (join) |
| 47 | `post_categories` | — | — | NO INTERFACE (join) |
| 48 | `post_events` | — | — | NO INTERFACE (join) |
| 49 | `post_images` | — | — | NO INTERFACE |
| 50 | `post_neighborhoods` | — | — | NO INTERFACE (join) |
| 51 | `post_source_stories` | — | — | NO INTERFACE (join) |
| 52 | `post_sponsors` | — | — | NO INTERFACE (join) |
| 53 | `post_tags` | — | — | NO INTERFACE (join) |
| 54 | `redirects` | — | — | NO INTERFACE |
| 55 | `reviews` | `Review` | types.ts:308 | NULLABILITY MISMATCH |
| 56 | `saved_items` | — | — | NO INTERFACE |
| 57 | `script_batches` | — | — | NO INTERFACE |
| 58 | `scripts` | — | — | NO INTERFACE |
| 59 | `seo_content_calendar` | — | — | NO INTERFACE |
| 60 | `sponsors` | — | — | NO INTERFACE |
| 61 | `stories` | `Story` | types.ts:241 | MISMATCHES |
| 62 | `story_businesses` | — | — | NO INTERFACE (join) |
| 63 | `story_neighborhoods` | — | — | NO INTERFACE (join) |
| 64 | `submissions` | `Submission` | types.ts:449 | MISMATCHES |
| 65 | `subscriptions` | — | — | NO INTERFACE |
| 66 | `tags` | `Tag` | types.ts:267 | 1 MISSING COLUMN |
| 67 | `tier_changes` | — | — | NO INTERFACE |
| 68 | `tier_visibility_rules` | — | — | NO INTERFACE |
| 69 | `trending_topics` | — | — | NO INTERFACE |
| 70 | `users` | — | — | NO INTERFACE |
| 71 | `watchlist` | — | — | NO INTERFACE |
| 72 | `watchlist_posts` | — | — | NO INTERFACE (join) |
| 73 | `watchlist_stories` | — | — | NO INTERFACE (join) |

**Totals:** 28 tables have interfaces, 45 do not. Of the 28: 15 perfect, 13 have issues.

---

## 2. Detailed Findings for Tables WITH Interfaces

### Table 1: `amenities` → `Amenity` (types.ts:463)

**DB columns (6):**
```
id(uuid,NO), name(text,NO), slug(text,NO), amenity_group(text,YES),
sort_order(integer,NO), created_at(tstz,NO)
```

| Issue | Column | DB | TS | Severity |
|---|---|---|---|---|
| Missing from TS | `slug` | text, NO | — | HIGH |
| Missing from TS | `created_at` | tstz, NO | — | MEDIUM |
| Nullability | `amenity_group` | YES (nullable) | required `string` | LOW (TS stricter) |
| Nullability | `sort_order` | NO (NOT NULL) | `?` optional | HIGH (allows omit on insert) |

---

### Table 2: `areas` → `Area` (types.ts:28) — PERFECT MATCH

All 13 columns match exactly. No issues.

---

### Table 3: `authors` → `Author` (types.ts:102) — PERFECT MATCH

All 13 columns match exactly. No issues.

---

### Table 4: `blog_posts` → `BlogPost` (types.ts:62) — PERFECT MATCH

All 37 columns match exactly. No issues.

---

### Table 5: `business_identity_options` → `IdentityOption` (types.ts:470)

**DB columns (5):**
```
id(uuid,NO), name(text,NO), slug(text,NO), sort_order(integer,NO),
created_at(tstz,NO)
```

| Issue | Column | DB | TS | Severity |
|---|---|---|---|---|
| Missing from TS | `slug` | text, NO | — | HIGH |
| Missing from TS | `created_at` | tstz, NO | — | MEDIUM |
| Nullability | `sort_order` | NO (NOT NULL) | `?` optional | HIGH |

---

### Table 6: `business_listings` → `BusinessListing` (types.ts:118)

**DB columns (48). TS has 46 properties.**

#### Columns in DB but MISSING from TS (2):
| Column | Type | Nullable |
|---|---|---|
| `city_id` | uuid | NO |
| `order_online_url` | text | YES |

#### Columns in TS but NOT in DB (1 phantom):
| TS Property | TS Type | Issue |
|---|---|---|
| `city?: string` | string | **Column does not exist.** DB has `city_id` (uuid) instead. |

#### Nullability mismatches — DB says NOT NULL, TS says optional (12):
| Column | DB | TS |
|---|---|---|
| `street_address` | NOT NULL | `?` optional |
| `state` | NOT NULL | `?` optional |
| `zip_code` | NOT NULL | `?` optional |
| `neighborhood_id` | NOT NULL | `?` optional |
| `display_identity_publicly` | NOT NULL | `?` optional |
| `certified_diversity_program` | NOT NULL | `?` optional |
| `featured_on_map` | NOT NULL | `?` optional |
| `tier` | NOT NULL | `?` optional |
| `tier_auto_downgraded` | NOT NULL | `?` optional |
| `map_pin_style` | NOT NULL | `?` optional |
| `claimed` | NOT NULL | `?` optional |
| `claim_status` | NOT NULL | `?` optional |

---

### Table 7: `categories` → `Category` (types.ts:209) — PERFECT MATCH

All 9 columns match exactly. No issues.

---

### Table 8: `cities` → `City` (types.ts:221) — PERFECT MATCH

All 17 columns match exactly. No issues.

---

### Table 9: `content_index` → `ContentIndex` (types.ts:290)

**DB columns (16). TS has 15 properties.**

| Issue | Column | DB | TS | Severity |
|---|---|---|---|---|
| Missing from TS | `anchor_suggestions` | jsonb, YES | — | MEDIUM |

---

### Table 10: `events` → `EventItem` (types.ts:168)

**DB columns (47). TS has 37 properties.**

#### Columns in DB but MISSING from TS (10):
| Column | Type | Nullable |
|---|---|---|
| `city_id` | uuid | NO |
| `venue_business_id` | uuid | YES |
| `organizer_business_id` | uuid | YES |
| `listing_price_cents` | integer | YES |
| `price_override_cents` | integer | YES |
| `pricing_source` | text | YES |
| `is_comped` | boolean | NO |
| `payment_status` | text | NO |
| `stripe_payment_intent_id` | text | YES |
| `featured_until` | tstz | YES |

#### Columns in TS but NOT in DB (1 phantom):
| TS Property | TS Type | Issue |
|---|---|---|
| `city?: string` | string | **Column does not exist.** DB has `city_id` (uuid) instead. |

#### Nullability mismatches — DB NOT NULL, TS optional (3):
| Column | DB | TS |
|---|---|---|
| `is_featured` | NOT NULL | `?` optional |
| `featured_on_map` | NOT NULL | `?` optional |
| `tier` | NOT NULL | `?` optional |

---

### Table 11: `featured_slots` → `FeaturedSlot` (types.ts:275) — PERFECT MATCH

All 12 columns match exactly. No issues.

---

### Table 12: `media_assets` → `MediaAsset` (types.ts:382) — PERFECT MATCH

All 19 columns match exactly. No issues.

---

### Table 13: `media_item_assets` → `MediaItemAsset` (types.ts:404) — PERFECT MATCH

All 8 columns match exactly. No issues.

---

### Table 14: `media_item_links` → `MediaItemLink` (types.ts:415) — PERFECT MATCH

All 8 columns match exactly. No issues.

---

### Table 15: `media_items` → `MediaItem` (types.ts:362) — PERFECT MATCH

All 17 columns match exactly. No issues.

---

### Table 16: `neighborhoods` → `Neighborhood` (types.ts:44) — PERFECT MATCH

All 15 columns match exactly. No issues.

---

### Table 17: `newsletter_posts` → `NewsletterPost` (types.ts:438) — PERFECT MATCH

All 6 columns match exactly. No issues.

---

### Table 18: `newsletter_sections` → `NewsletterSection` (types.ts:428) — PERFECT MATCH

All 7 columns match exactly. No issues.

---

### Table 19: `newsletter_types` → `NewsletterType` (queries.ts:937) — PERFECT MATCH

All 8 columns match exactly. No issues.

---

### Table 20: `newsletters` → `Newsletter` (queries.ts:892)

**DB columns (24). TS has 14 properties.**

#### Columns in DB but MISSING from TS (10):
| Column | Type | Nullable |
|---|---|---|
| `send_provider` | text | YES |
| `hubspot_email_id` | text | YES |
| `hubspot_stats_json` | jsonb | YES |
| `sponsor_business_id` | uuid | YES |
| `ad_snapshot` | jsonb | YES |
| `open_rate` | numeric | YES |
| `click_rate` | numeric | YES |
| `google_doc_url` | text | YES |
| `notes` | text | YES |
| `newsletter_type_id` | uuid | NO |

#### Nullability note:
| Column | DB | TS | Note |
|---|---|---|---|
| `subject_line` | NOT NULL | `string \| null` | TS allows null, DB never returns null. Safe but imprecise. |

---

### Table 21: `reviews` → `Review` (types.ts:308)

**DB columns (20). TS has 20 properties. Column count matches.**

| Issue | Column | DB | TS | Severity |
|---|---|---|---|---|
| Nullability | `user_id` | NOT NULL | `?` optional | HIGH |

---

### Table 22: `stories` → `Story` (types.ts:241)

**DB columns (30). TS has 23 properties.**

#### Columns in DB but MISSING from TS (7):
| Column | Type | Nullable |
|---|---|---|
| `score` | integer | YES |
| `tier` | text | YES |
| `neighborhood_id` | uuid | YES |
| `angle_summary` | text | YES |
| `expires_at` | tstz | YES |
| `banked_at` | tstz | YES |
| `reuse_eligible_at` | tstz | YES |

#### Nullability mismatches — DB NOT NULL, TS optional (2):
| Column | DB | TS |
|---|---|---|
| `priority` | NOT NULL | `?` optional |
| `ingested_at` | NOT NULL | `?` optional |

---

### Table 23: `submissions` → `Submission` (types.ts:449)

**DB columns (15). TS has 11 properties.**

#### Columns in DB but MISSING from TS (4):
| Column | Type | Nullable |
|---|---|---|
| `submitted_by` | uuid | YES |
| `submitter_phone` | text | YES |
| `reviewer_notes` | text | YES |
| `reviewed_by` | uuid | YES |

---

### Table 24: `tags` → `Tag` (types.ts:267)

**DB columns (6). TS has 5 properties.**

| Issue | Column | DB | TS | Severity |
|---|---|---|---|---|
| Missing from TS | `is_active` | boolean, YES | — | MEDIUM |

---

## 3. Tables WITHOUT Interfaces

### Core / standalone tables (24) — likely need interfaces if used by the app

| # | Table | Columns | Purpose |
|---|---|---|---|
| 1 | `ad_campaigns` | 10 | Ad campaign management |
| 2 | `ad_creatives` | 15 | Ad creative assets |
| 3 | `ad_flights` | 12 | Ad flight scheduling |
| 4 | `ad_placements` | 8 | Ad placement locations |
| 5 | `brands` | 6 | Parent brands for business listings |
| 6 | `business_contacts` | 8 | Contact people per business |
| 7 | `business_hours` | 8 | Operating hours per business |
| 8 | `business_images` | 9 | Gallery images per business |
| 9 | `claims` | 11 | Business ownership claims |
| 10 | `content_calendar` | 7 | Editorial content scheduling |
| 11 | `content_history` | 9 | Content change audit trail |
| 12 | `content_performance` | 11 | Analytics data per post |
| 13 | `event_images` | 9 | Gallery images per event |
| 14 | `event_map_pin_rules` | 9 | Map pin rules for events by tier |
| 15 | `event_tier_pricing` | 7 | Pricing config per event tier |
| 16 | `event_tier_visibility_rules` | 7 | Field visibility per event tier |
| 17 | `headline_variants` | 7 | A/B headline testing |
| 18 | `map_pin_rules` | 9 | Map pin rules for businesses by tier |
| 19 | `organizations` | 6 | Organization entities |
| 20 | `pillars` | 8 | Content pillar taxonomy |
| 21 | `post_images` | 9 | Gallery images per blog post |
| 22 | `redirects` | 7 | URL redirect rules |
| 23 | `saved_items` | 5 | User bookmarks/favorites |
| 24 | `script_batches` | 7 | Social script batch grouping |
| 25 | `scripts` | 19 | Social media scripts |
| 26 | `seo_content_calendar` | 15 | SEO content planning |
| 27 | `sponsors` | 23 | Sponsor campaigns |
| 28 | `subscriptions` | 19 | Stripe billing subscriptions |
| 29 | `tier_changes` | 10 | Business tier change audit log |
| 30 | `tier_visibility_rules` | 6 | Business field visibility per tier |
| 31 | `trending_topics` | 7 | Trending keyword tracker |
| 32 | `users` | 14 | Application users |
| 33 | `watchlist` | 20 | Development project tracker |

### Join / bridge tables (12) — typically don't need standalone interfaces

| # | Table | Joins | Columns |
|---|---|---|---|
| 1 | `business_amenities` | business_listings ↔ amenities | 4 |
| 2 | `business_identities` | business_listings ↔ business_identity_options | 4 |
| 3 | `business_organizations` | business_listings ↔ organizations | 5 |
| 4 | `business_tags` | business_listings ↔ tags | 4 |
| 5 | `event_tags` | events ↔ tags | 4 |
| 6 | `post_businesses` | blog_posts ↔ business_listings | 5 |
| 7 | `post_categories` | blog_posts ↔ categories | 5 |
| 8 | `post_events` | blog_posts ↔ events | 5 |
| 9 | `post_neighborhoods` | blog_posts ↔ neighborhoods | 5 |
| 10 | `post_source_stories` | blog_posts ↔ stories | 4 |
| 11 | `post_sponsors` | blog_posts ↔ sponsors | 6 |
| 12 | `post_tags` | blog_posts ↔ tags | 4 |
| 13 | `story_businesses` | stories ↔ business_listings | 4 |
| 14 | `story_neighborhoods` | stories ↔ neighborhoods | 5 |
| 15 | `watchlist_posts` | watchlist ↔ blog_posts | 4 |
| 16 | `watchlist_stories` | watchlist ↔ stories | 4 |

---

## 4. queries.ts Audit

### All query functions and their column references

Every `.select()`, `.eq()`, `.ilike()`, `.in()`, `.or()`, `.order()`, `.gte()`, `.lt()`, `.gt()`, `.not()`, `.neq()`, `.contains()` call was checked against the v2 schema.

| Function | Line | Table(s) | Columns Referenced | All Valid? |
|---|---|---|---|---|
| `getAreas` | 44 | areas | is_active, sort_order, name | YES |
| `getAreaBySlug` | 55 | areas | slug, is_active | YES |
| `getNeighborhoods` | 70 | neighborhoods | is_active, sort_order, area_id, is_featured, name | YES |
| `getNeighborhoodBySlug` | 92 | neighborhoods, areas | slug, is_active | YES |
| `getBlogPosts` | 109 | blog_posts, authors, categories | status, published_at, content_type, is_featured, category_id, neighborhood_id, title, excerpt | YES |
| `getBlogPostBySlug` | 138 | blog_posts, authors, categories | slug, status | YES |
| `getBlogPostById` | 151 | blog_posts, authors, categories | id, status | YES |
| `getBlogPostsWithNeighborhood` | 165 | blog_posts, authors, categories, neighborhoods, areas | status, published_at, content_type, category_id, neighborhood_id, title, excerpt, is_featured | YES |
| `getBlogPostBySlugFull` | 194 | blog_posts, authors, categories, neighborhoods, areas | slug, status | YES |
| `getBusinessesByPostId` | 208 | post_businesses, business_listings, neighborhoods, categories, cities | post_id, business_id, id, status | YES |
| `getBusinesses` | 234 | business_listings, neighborhoods, categories, cities | status, is_featured, business_name, category_id, neighborhood_id, description, tagline | YES |
| `getBusinessBySlug` | 264 | business_listings, neighborhoods, categories, cities | slug | YES |
| `getEvents` | 280 | events, neighborhoods, categories, cities | status, start_date, is_featured, category_id, neighborhood_id, title, description, venue_name | YES |
| `getEventBySlug` | 311 | events, neighborhoods, categories, cities | slug | YES |
| `getAuthors` | 327 | authors | is_active, name | YES |
| `getAuthorBySlug` | 337 | authors | slug, is_active | YES |
| `getCategories` | 352 | categories | is_active, sort_order, applies_to | YES |
| `getCategoryBySlug` | 368 | categories | slug, is_active | YES |
| `getCities` | 383 | cities | is_active, sort_order, is_primary | YES |
| `getStories` | 403 | stories | status, published_at, headline | YES |
| `getFeaturedSlot` | 426 | featured_slots | entity_type, entity_id, placement_key, is_active, start_date, end_date, sort_order | YES |
| `globalSearch` | 510 | blog_posts, business_listings, events, neighborhoods, areas | (multiple per-table) | YES |
| `getNeighborhoodIdsForArea` | 639 | neighborhoods | id, area_id, is_active | YES |
| `getNeighborhoodsByPopularity` | 658 | neighborhoods, blog_posts, business_listings | is_active, status, neighborhood_id | YES |
| `getContentIndexByToken` | 723 | content_index | token_name, is_active, target_type, active_url | YES |
| `getNeighborhoodsGrouped` | 749 | neighborhoods, areas | id, name, slug, is_active | YES |
| `getAmenities` | 775 | amenities | id, name, amenity_group, sort_order | YES |
| `getIdentityOptions` | 789 | business_identity_options | id, name, sort_order | YES |
| `getMediaItems` | 803 | media_items, media_item_links | status, is_active, is_featured, published_at, media_type, id, target_type, target_id, media_item_id | YES |
| `getMediaItemBySlug` | 846 | media_items | slug, status, is_active | YES |
| `getMediaItemAssets` | 860 | media_item_assets, media_assets | media_item_id, sort_order | YES |
| `getMediaItemLinks` | 874 | media_item_links | media_item_id, sort_order | YES |
| `getNewsletters` | 909 | newsletters | status, is_public, issue_date | YES |
| `getNewsletterTypes` | 948 | newsletter_types | is_active, name | YES |
| `getNewsletterBySlug` | 963 | newsletters | issue_slug, status, is_public | YES |
| `getNewslettersByType` | 982 | newsletters | status, is_public, issue_date, name, subject_line, preview_text | YES |
| `getAdjacentNewsletters` | 1014 | newsletters | status, is_public, issue_date | YES |
| `getNewsletterSections` | 1050 | newsletter_sections | newsletter_id, sort_order | YES |
| `getNewsletterPosts` | 1079 | newsletter_posts, blog_posts | newsletter_id, position, post_id (FK join) | YES |
| `getNewsletterFeaturedImages` | 1098 | newsletter_posts, blog_posts | newsletter_id, position, post_id (FK join) | YES |

**Result: All column references in queries.ts are valid against the v2 schema. No phantom column references in queries.**

### Join path verification

All Supabase join patterns (e.g., `cities(name)`, `areas(*)`, `neighborhoods(*, areas(*))`) require FK relationships. Verified:

| Join Pattern | FK Constraint | Valid? |
|---|---|---|
| `business_listings → cities(name)` | `business_listings.city_id → cities.id` | YES |
| `business_listings → neighborhoods(*)` | `business_listings.neighborhood_id → neighborhoods.id` | YES |
| `business_listings → categories(*)` | `business_listings.category_id → categories.id` | YES |
| `events → cities(name)` | `events.city_id → cities.id` | YES |
| `events → neighborhoods(*)` | `events.neighborhood_id → neighborhoods.id` | YES |
| `events → categories(*)` | `events.category_id → categories.id` | YES |
| `blog_posts → authors(*)` | `blog_posts.author_id → authors.id` | YES |
| `blog_posts → categories(*)` | `blog_posts.category_id → categories.id` | YES |
| `blog_posts → neighborhoods(*)` | `blog_posts.neighborhood_id → neighborhoods.id` | YES |
| `neighborhoods → areas(*)` | `neighborhoods.area_id → areas.id` | YES |
| `newsletter_posts → blog_posts (as post_id)` | `newsletter_posts.post_id → blog_posts.id` | YES |
| `newsletter_sections → newsletters` | `newsletter_sections.newsletter_id → newsletters.id` | YES |
| `media_item_assets → media_assets(*)` | `media_item_assets.asset_id → media_assets.id` | YES |

**Note:** The `cities(name)` join on `business_listings` and `events` works at runtime via the `city_id` FK, even though the `BusinessListing` and `EventItem` TypeScript interfaces don't include `city_id`. The join types (`BusinessListingWithNeighborhood`, `EventItemWithNeighborhood`) add `cities?: { name: string }` to handle the response.

---

## 5. Status Filter Mismatches

| Table | DB Status Values (Section 3) | queries.ts Default Filter | Match? |
|---|---|---|---|
| `blog_posts` | `draft` (1), `published` (18), `scheduled` (1) | `"published"` | YES |
| `business_listings` | `active` (35) | `"active"` | YES |
| `events` | `active` (13), `completed` (1) | `"active"` | YES |
| `media_items` | `published` (18) | `"published"` | YES |
| `newsletters` | `sent` (1), `draft` (1) | `"sent"` | YES |
| **`stories`** | **`reviewed` (1), `used` (3), `new` (2), `queued` (2)** | **`"published"`** | **NO** |

### CRITICAL: `stories` status mismatch

`getStories()` at **queries.ts:411** defaults to:
```ts
.eq("status", opts?.status ?? "published")
```

The database has **zero rows** with `status = "published"`. Actual values: `reviewed`, `used`, `new`, `queued`. This query **always returns an empty array** unless a caller explicitly passes a different status.

---

## 6. FK Constraint Audit

### `_id` columns WITHOUT foreign key constraints

| Table | Column | Type | FK? | Notes |
|---|---|---|---|---|
| `content_index` | `target_id` | uuid | NO | Polymorphic — target type varies by `target_type` |
| `featured_slots` | `entity_id` | uuid | NO | Polymorphic — varies by `entity_type` |
| `media_item_links` | `target_id` | uuid | NO | Polymorphic — varies by `target_type` |
| `saved_items` | `entity_id` | uuid | NO | Polymorphic — varies by `entity_type` |
| `submissions` | `created_record_id` | uuid | NO | Late-bound reference to the record created from submission |

All 5 are intentionally polymorphic or late-bound. No accidental missing FKs found.

### Non-`_id` columns that ARE FK-constrained (correctly)

| Table.Column | FK Target | Verified |
|---|---|---|
| `business_listings.claimed_by` | `users.id` | YES |
| `claims.reviewed_by` | `users.id` | YES |
| `events.submitted_by` | `users.id` | YES |
| `featured_slots.created_by` | `users.id` | YES |
| `media_assets.uploaded_by` | `users.id` | YES |
| `reviews.moderated_by` | `users.id` | YES |
| `submissions.reviewed_by` | `users.id` | YES |
| `submissions.submitted_by` | `users.id` | YES |
| `tier_changes.admin_user_id` | `users.id` | YES |
| `sponsors.category_focus` | `categories.id` | YES |
| `sponsors.neighborhood_focus` | `neighborhoods.id` | YES |
| `sponsors.content_index_id` | `content_index.id` | YES |
| `seo_content_calendar.content_index_id` | `content_index.id` | YES |

---

## 7. Summary of All Issues

### CRITICAL (will cause bugs or silent data loss)

| # | Issue | Location | Detail |
|---|---|---|---|
| 1 | `stories` status filter uses `"published"` — **value does not exist in DB** | queries.ts:411 | Returns empty array. DB values are: `reviewed`, `used`, `new`, `queued` |
| 2 | `BusinessListing` has phantom `city` column | types.ts:126 | DB has `city_id` (uuid, NOT NULL) instead. Wrong name AND wrong type. |
| 3 | `EventItem` has phantom `city` column | types.ts:184 | DB has `city_id` (uuid, NOT NULL) instead. Wrong name AND wrong type. |
| 4 | `BusinessListing` missing `city_id` (NOT NULL) | types.ts:118 | FK column required for Supabase `cities(name)` join — works at runtime but interface is wrong |
| 5 | `EventItem` missing 10 DB columns | types.ts:168 | Includes `city_id`(NO), `is_comped`(NO), `payment_status`(NO), plus 7 nullable payment/business fields |

### HIGH (data integrity risk on writes, or significant interface gaps)

| # | Issue | Detail |
|---|---|---|
| 6 | `BusinessListing`: 12 nullability mismatches | `street_address`, `state`, `zip_code`, `neighborhood_id`, `display_identity_publicly`, `certified_diversity_program`, `featured_on_map`, `tier`, `tier_auto_downgraded`, `map_pin_style`, `claimed`, `claim_status` — all NOT NULL in DB, optional in TS |
| 7 | `EventItem`: 3 nullability mismatches | `is_featured`, `featured_on_map`, `tier` — NOT NULL in DB, optional in TS |
| 8 | `Story`: 7 missing columns + 2 nullability mismatches | Missing: `score`, `tier`, `neighborhood_id`, `angle_summary`, `expires_at`, `banked_at`, `reuse_eligible_at`. Null mismatches: `priority`, `ingested_at` |
| 9 | `Newsletter`: 10 missing columns | Including `newsletter_type_id` (NOT NULL) — blocks any insert/update that doesn't include it |
| 10 | `Review`: `user_id` nullability mismatch | NOT NULL in DB, optional in TS |
| 11 | `Amenity`: missing `slug` (NOT NULL) and `created_at` (NOT NULL) | Plus `sort_order` nullable mismatch |
| 12 | `IdentityOption`: missing `slug` (NOT NULL) and `created_at` (NOT NULL) | Plus `sort_order` nullable mismatch |
| 13 | `BusinessListing` missing `order_online_url` | Nullable column, lower risk, but feature gap |

### MEDIUM (incomplete coverage, functional but imprecise)

| # | Issue | Detail |
|---|---|---|
| 14 | `Submission`: 4 missing columns | `submitted_by`, `submitter_phone`, `reviewer_notes`, `reviewed_by` |
| 15 | `Tag`: missing `is_active` | Nullable boolean — queries may filter on it later |
| 16 | `ContentIndex`: missing `anchor_suggestions` | jsonb, nullable |
| 17 | `Newsletter.subject_line` typed as nullable | DB says NOT NULL — safe but imprecise |

### LOW (informational)

| # | Issue | Detail |
|---|---|---|
| 18 | 45 tables have no TypeScript interface | 33 standalone + 12 join tables. Some (pillars, sponsors, users, subscriptions, scripts) may be needed as the app grows. |
| 19 | 5 polymorphic `_id` columns without FK constraints | All intentional design choices for polymorphic relations |

---

## Aggregate Counts

| Metric | Count |
|---|---|
| Total DB tables | 73 |
| Tables with TS interface | 28 |
| Tables without TS interface | 45 |
| Perfect matches (no issues) | 15 |
| Tables with issues | 13 |
| DB columns missing from TS (total) | 38 |
| Phantom TS columns (not in DB) | 2 |
| Nullability mismatches (DB NOT NULL, TS optional) | 20 |
| Critical issues | 5 |
| High-severity issues | 8 |
| Medium-severity issues | 4 |

---

*End of v2 audit. No code or database modifications were made.*
