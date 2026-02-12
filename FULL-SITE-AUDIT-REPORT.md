# FULL SITE AUDIT REPORT

**Generated:** 2026-02-11
**Source of truth:** `SUPABASE-REAL-SCHEMA.md` (exported directly from Supabase `information_schema`)
**Files audited:** `lib/types.ts`, `lib/queries.ts`

---

## CRITICAL FINDING: Schema Dump Incomplete

**7 tables exist in the database (confirmed by FK constraints in Section 2) but are MISSING from the Section 1 column listing.** Any interface or query referencing these tables cannot be fully verified.

| Missing Table | Evidence |
|---|---|
| `areas` | FK source (`areas.city_id → cities.id`) and FK target (`neighborhoods.area_id → areas.id`) |
| `authors` | FK target (`blog_posts.author_id → authors.id`) |
| `amenities` | FK target (`business_amenities.amenity_id → amenities.id`) |
| `ad_campaigns` | FK source (`ad_campaigns.sponsor_id → sponsors.id`) |
| `ad_creatives` | FK source (`ad_creatives.campaign_id → ad_campaigns.id`) |
| `ad_flights` | FK source (`ad_flights.creative_id → ad_creatives.id`) |
| `ad_placements` | FK target (`ad_flights.placement_id → ad_placements.id`) |

**Action required:** Re-run the Section 1 schema dump. These tables were likely filtered out or the query had a `WHERE` clause that excluded them.

---

## 1. types.ts vs Database Mismatches

### 1A. Columns in DB but MISSING from TypeScript interface

#### `BusinessListing` — 2 missing columns
| DB Column | DB Type | Nullable |
|---|---|---|
| `city_id` | uuid | NO |
| `order_online_url` | text | YES |

#### `EventItem` — 10 missing columns
| DB Column | DB Type | Nullable |
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
| `featured_until` | timestamp with time zone | YES |

#### `Story` — 8 missing columns
| DB Column | DB Type | Nullable |
|---|---|---|
| `category_id` | uuid | YES |
| `score` | integer | YES |
| `tier` | text | YES |
| `neighborhood_id` | uuid | YES |
| `angle_summary` | text | YES |
| `expires_at` | timestamp with time zone | YES |
| `banked_at` | timestamp with time zone | YES |
| `reuse_eligible_at` | timestamp with time zone | YES |

#### `Tag` — 1 missing column
| DB Column | DB Type | Nullable |
|---|---|---|
| `is_active` | boolean | YES |

#### `ContentIndex` — 1 missing column
| DB Column | DB Type | Nullable |
|---|---|---|
| `anchor_suggestions` | jsonb | YES |

#### `Submission` — 4 missing columns
| DB Column | DB Type | Nullable |
|---|---|---|
| `submitted_by` | uuid | YES |
| `submitter_phone` | text | YES |
| `reviewer_notes` | text | YES |
| `reviewed_by` | uuid | YES |

#### `IdentityOption` — 2 missing columns
| DB Column | DB Type | Nullable |
|---|---|---|
| `slug` | text | NO |
| `created_at` | timestamp with time zone | NO |

#### `Newsletter` (inline in queries.ts) — 10 missing columns
| DB Column | DB Type | Nullable |
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

**Total: 38 DB columns missing from TypeScript interfaces.**

---

### 1B. Columns in TypeScript interface but NOT in database

#### `BusinessListing`
| TS Property | TS Type | Issue |
|---|---|---|
| `city` | `string?` | **Column does not exist in DB.** DB has `city_id` (uuid) instead. |

#### `EventItem`
| TS Property | TS Type | Issue |
|---|---|---|
| `city` | `string?` | **Column does not exist in DB.** DB has `city_id` (uuid) instead. |

**Total: 2 phantom columns in TypeScript.**

---

### 1C. Nullability Mismatches (DB says NOT NULL, types.ts says optional)

#### `BusinessListing` — 12 fields
| Column | DB Nullable | TS Optional? |
|---|---|---|
| `street_address` | NO | `?` optional |
| `state` | NO | `?` optional |
| `zip_code` | NO | `?` optional |
| `neighborhood_id` | NO | `?` optional |
| `display_identity_publicly` | NO | `?` optional |
| `certified_diversity_program` | NO | `?` optional |
| `featured_on_map` | NO | `?` optional |
| `tier` | NO | `?` optional |
| `tier_auto_downgraded` | NO | `?` optional |
| `map_pin_style` | NO | `?` optional |
| `claimed` | NO | `?` optional |
| `claim_status` | NO | `?` optional |

#### `EventItem` — 3 fields
| Column | DB Nullable | TS Optional? |
|---|---|---|
| `is_featured` | NO | `?` optional |
| `featured_on_map` | NO | `?` optional |
| `tier` | NO | `?` optional |

#### `Story` — 2 fields
| Column | DB Nullable | TS Optional? |
|---|---|---|
| `priority` | NO | `?` optional |
| `ingested_at` | NO | `?` optional |

#### `Review` — 1 field
| Column | DB Nullable | TS Optional? |
|---|---|---|
| `user_id` | NO | `?` optional |

**Total: 18 nullability mismatches.** These won't cause runtime errors when reading, but they allow TypeScript code to omit required fields on inserts/updates.

---

### 1D. Cannot Verify (tables missing from Section 1 schema dump)

| Interface | Maps to Table | Status |
|---|---|---|
| `Area` | `areas` | Table missing from dump — cannot verify |
| `Author` | `authors` | Table missing from dump — cannot verify |
| `Amenity` | `amenities` | Table missing from dump — cannot verify |

---

## 2. Code vs Database Mismatches (queries.ts)

### Queries referencing tables not in Section 1

These queries work at runtime (the tables exist) but cannot be verified against the schema dump:

| Function | Line | Table | Issue |
|---|---|---|---|
| `getAreas` | 46 | `areas` | Table not in Section 1 |
| `getAreaBySlug` | 57 | `areas` | Table not in Section 1 |
| `getAuthors` | 329 | `authors` | Table not in Section 1 |
| `getAuthorBySlug` | 339 | `authors` | Table not in Section 1 |
| `getAmenities` | 777 | `amenities` | Table not in Section 1 |
| `getNeighborhoodBySlug` | 97 | `areas` (join) | Table not in Section 1 |
| `getNeighborhoodsGrouped` | 752 | `areas` (join) | Table not in Section 1 |
| `globalSearch` | 611 | `areas` | Table not in Section 1 |
| All blog_post queries | various | `authors` (join) | Table not in Section 1 |

### Column references verified against Section 1

All `.select()`, `.eq()`, `.ilike()`, `.in()`, `.or()`, `.order()`, `.gte()`, `.lt()`, `.gt()`, `.not()`, `.neq()`, and `.contains()` calls in queries.ts reference columns that **do exist** in their respective tables in Section 1. **No phantom column references found** for tables present in the dump.

---

## 3. Status Filter Check

| Table | DB Status Values (Section 3) | queries.ts Default Filter | Match? |
|---|---|---|---|
| `blog_posts` | `draft`, `published`, `scheduled` | `"published"` | YES |
| `business_listings` | `active` | `"active"` | YES |
| `events` | `active`, `completed` | `"active"` | YES |
| `media_items` | `published` | `"published"` | YES |
| `newsletters` | `sent`, `draft` | `"sent"` | YES |
| `stories` | `reviewed`, `used`, `new`, `queued` | **`"published"`** | **NO — MISMATCH** |

### CRITICAL: `stories` status mismatch

`getStories()` at line 411 defaults to:
```ts
.eq("status", opts?.status ?? "published")
```

But the database contains **zero rows** with `status = "published"`. The actual values are `reviewed` (1), `used` (3), `new` (2), `queued` (2). This query will always return an empty array unless a caller explicitly overrides the status parameter.

---

## 4. FK Check — `_id` Columns Missing Foreign Key Constraints

| Table | Column | DB Type | FK Exists? | Notes |
|---|---|---|---|---|
| `content_index` | `target_id` | uuid | **NO** | Polymorphic — points to different tables based on `target_type` |
| `featured_slots` | `entity_id` | uuid | **NO** | Polymorphic — points to different tables based on `entity_type` |
| `media_item_links` | `target_id` | uuid | **NO** | Polymorphic — points to different tables based on `target_type` |
| `saved_items` | `entity_id` | uuid | **NO** | Polymorphic — points to different tables based on `entity_type` |
| `submissions` | `created_record_id` | uuid | **NO** | References the record created from this submission; no FK constraint |

All 5 are **intentionally polymorphic** or late-bound references. No accidental missing FKs were found. The schema is clean on this front.

**Note:** Some non-`_id` columns also serve as FKs and DO have constraints (e.g., `claimed_by → users.id`, `submitted_by → users.id`, `uploaded_by → users.id`, `moderated_by → users.id`, `reviewed_by → users.id`, `category_focus → categories.id`, `neighborhood_focus → neighborhoods.id`). These are all properly constrained.

---

## 5. Tables Missing TypeScript Interfaces

**45 tables** in Section 1 have no corresponding TypeScript interface in `lib/types.ts`:

### Core / standalone tables (need interfaces if used in app)
| Table | Columns | Notes |
|---|---|---|
| `brands` | 6 | Parent brand for business_listings |
| `claims` | 11 | Business claim requests |
| `content_calendar` | 6 | Editorial scheduling |
| `content_history` | 9 | Content change tracking |
| `content_performance` | 11 | Analytics per post |
| `event_map_pin_rules` | 9 | Map display rules for events |
| `event_tier_pricing` | 7 | Event tier pricing config |
| `event_tier_visibility_rules` | 7 | Event field visibility per tier |
| `headline_variants` | 7 | A/B headline testing |
| `map_pin_rules` | 9 | Map display rules for businesses |
| `organizations` | 6 | Org memberships for businesses |
| `pillars` | 8 | Content pillars |
| `redirects` | 7 | URL redirect rules |
| `saved_items` | 5 | User bookmarks |
| `script_batches` | 6 | Social script batches |
| `scripts` | 19 | Social media scripts |
| `seo_content_calendar` | 15 | SEO content planning |
| `sponsors` | 18 | Sponsor campaigns |
| `subscriptions` | 18 | Stripe billing |
| `tier_changes` | 10 | Tier change audit log |
| `tier_visibility_rules` | 6 | Business field visibility per tier |
| `trending_topics` | 7 | Trending keyword tracker |
| `users` | 13 | App users |
| `watchlist` | 16 | Development project tracker |

### Detail / child tables (may not need standalone interfaces)
| Table | Notes |
|---|---|
| `business_contacts` | Child of business_listings |
| `business_hours` | Child of business_listings |
| `business_images` | Child of business_listings |
| `event_images` | Child of events |
| `post_images` | Child of blog_posts |

### Join tables (typically don't need interfaces)
| Table | Joins |
|---|---|
| `business_amenities` | business_listings ↔ amenities |
| `business_identities` | business_listings ↔ business_identity_options |
| `business_organizations` | business_listings ↔ organizations |
| `business_tags` | business_listings ↔ tags |
| `event_tags` | events ↔ tags |
| `post_businesses` | blog_posts ↔ business_listings |
| `post_categories` | blog_posts ↔ categories |
| `post_events` | blog_posts ↔ events |
| `post_neighborhoods` | blog_posts ↔ neighborhoods |
| `post_source_stories` | blog_posts ↔ stories |
| `post_sponsors` | blog_posts ↔ sponsors |
| `post_tags` | blog_posts ↔ tags |
| `story_businesses` | stories ↔ business_listings |
| `story_neighborhoods` | stories ↔ neighborhoods |
| `watchlist_posts` | watchlist ↔ blog_posts |
| `watchlist_stories` | watchlist ↔ stories |

---

## Summary of Issues by Severity

### CRITICAL (will cause bugs or data loss)
| # | Issue | Location |
|---|---|---|
| 1 | `stories` status filter uses `"published"` — value does not exist in DB | `queries.ts:411` |
| 2 | `BusinessListing` has phantom `city` column — DB has `city_id` instead | `types.ts:126` |
| 3 | `EventItem` has phantom `city` column — DB has `city_id` instead | `types.ts:184` |
| 4 | `BusinessListing` missing `city_id` (NOT NULL) — queries use `cities(name)` join which relies on this FK | `types.ts:118` |
| 5 | `EventItem` missing 10 DB columns including `city_id`, `venue_business_id`, payment fields | `types.ts:168` |

### HIGH (data integrity risk on writes)
| # | Issue |
|---|---|
| 6 | 18 nullability mismatches — types.ts marks NOT NULL columns as optional, allowing invalid inserts |
| 7 | `Story` missing 8 DB columns (`category_id`, `score`, `tier`, `neighborhood_id`, etc.) |
| 8 | `Newsletter` (queries.ts inline type) missing 10 DB columns including `newsletter_type_id` (NOT NULL) |

### MEDIUM (incomplete coverage)
| # | Issue |
|---|---|
| 9 | Schema dump missing 7 tables (`areas`, `authors`, `amenities`, `ad_*`) — cannot fully audit |
| 10 | `Submission` missing 4 columns (`submitted_by`, `submitter_phone`, `reviewer_notes`, `reviewed_by`) |
| 11 | `Tag` missing `is_active` column |
| 12 | `ContentIndex` missing `anchor_suggestions` column |
| 13 | `IdentityOption` missing `slug` and `created_at` |

### LOW (informational)
| # | Issue |
|---|---|
| 14 | 45 tables have no TypeScript interface (24 core + 5 child + 16 join tables) |
| 15 | 5 `_id` columns without FK constraints (all intentionally polymorphic) |

---

*End of audit. No code or database modifications were made.*
