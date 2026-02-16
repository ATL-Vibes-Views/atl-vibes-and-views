# PRE-BUILD STRUCTURAL INTEGRITY AUDIT

**Date:** 2026-02-16
**Auditor:** Claude Opus 4.6 (automated codebase analysis)
**Scope:** Full codebase + schema-dump.sql cross-reference
**Branch:** `claude/audit-codebase-integrity-V460i`

---

## 1) ENUM & CHECK CONSTRAINT VALIDATION

### Schema-Authoritative Allowed Values

| Table | Column | Allowed Values |
|-------|--------|----------------|
| `stories` | `status` | `new`, `reviewed`, `queued`, `skipped`, `assigned_blog`, `assigned_script`, `assigned_dual`, `assigned_social`, `draft_script`, `draft_social`, `banked`, `used`, `discarded` |
| `stories` | `priority` | `breaking`, `high`, `medium`, `low`, `evergreen` |
| `stories` | `tier` | `script`, `blog`, `social` |
| `scripts` | `status` | `draft`, `approved`, `filmed`, `posted`, `killed` |
| `scripts` | `platform` | `NULL`, `reel`, `tiktok`, `youtube_short`, `carousel`, `static`, `linkedin`, `facebook`, `x`, `instagram` |
| `scripts` | `format` | `NULL`, `talking_head`, `green_screen`, `voiceover`, `text_overlay`, `b_roll` |
| `blog_posts` | `status` | `draft`, `ready_for_review`, `scheduled`, `published`, `archived` |
| `blog_posts` | `content_type` | `news`, `guide` |
| `blog_posts` | `type` | `NULL`, `news`, `roundup`, `evergreen_seo`, `sponsor_feature`, `neighborhood_guide` |
| `blog_posts` | `content_source` | `NULL`, `automation_pipeline`, `manual`, `guest_submission` |
| `newsletters` | `status` | `planning`, `draft`, `ready`, `scheduled`, `sent`, `archived` |
| `newsletters` | `send_provider` | `NULL`, `hubspot`, `other` |
| `sponsors` | `status` | `prospect`, `active`, `paused`, `completed` |
| `sponsors` | `package_type` | `blog`, `script`, `social`, `website_ad`, `newsletter_ad`, `combo` |
| `sponsor_deliverables` | `status` | **NO CHECK CONSTRAINT** (comment says: `active`, `completed`, `paused`) |
| `system_logs` | `scenario` | `s1_intake`, `s3_scoring`, `s4_blog_gen`, `s5_script_gen`, `s6_social_gen`, `s8_publish`, `s10_analytics`, `s11_health_check`, `auth_refresh`, `manual` |
| `system_logs` | `severity` | `info`, `warning`, `error`, `critical` |
| `system_logs` | `platform` | `instagram`, `youtube`, `tiktok`, `facebook`, `x`, `linkedin`, `website`, `hubspot`, `make`, `claude_api`, `supabase` |
| `published_content` | `status` | **NO STATUS COLUMN** (only `content_format` and `platform` constraints) |
| `reviews` | `status` | `pending_review`, `approved`, `flagged`, `rejected`, `removed` |
| `submissions` | `status` | `pending`, `under_review`, `approved`, `rejected`, `needs_info` |
| `subscriptions` | `status` | `active`, `past_due`, `canceled`, `trialing`, `paused` |
| `business_listings` | `status` | `draft`, `pending_review`, `active`, `suspended`, `expired` |
| `business_listings` | `tier` | `Free`, `Standard`, `Premium` |
| `business_listings` | `map_pin_style` | `gray`, `standard`, `premium` |
| `events` | `status` | `draft`, `pending_review`, `active`, `canceled`, `completed`, `expired` |
| `events` | `tier` | `Free`, `Standard`, `Premium` |
| `script_batches` | `status` | `planning`, `active`, `completed` |
| `media_items` | `status` | `draft`, `scheduled`, `published`, `archived` |

### CRITICAL MISMATCHES: Code vs Schema

#### MISMATCH 1 — `stories.status`: "scored" and "in_progress" NOT IN SCHEMA

**Schema allows:** `new`, `reviewed`, `queued`, `skipped`, `assigned_blog`, `assigned_script`, `assigned_dual`, `assigned_social`, `draft_script`, `draft_social`, `banked`, `used`, `discarded`

**Code references to INVALID values:**

| File | Line | Value Used | Context |
|------|------|-----------|---------|
| `app/admin/automation/page.tsx` | 19 | `"scored"` | `.eq("status", "scored")` — count query |
| `app/admin/automation/page.tsx` | 20 | `"in_progress"` | `.eq("status", "in_progress")` — count query |
| `app/admin/layout.tsx` | 52 | `"scored"` | `.eq("status", "scored")` — sidebar badge count |
| `app/admin/layout.tsx` | 54 | `"in_progress"` | `.eq("status", "in_progress")` — sidebar badge count |
| `app/admin/social/page.tsx` | 44 | `"scored"` | `.eq("status", "scored")` — social queue query |
| `app/admin/pipeline/PipelineClient.tsx` | 34, 54, 153, 220 | `"scored"` | Filter/display logic |
| `app/admin/automation/AutomationClient.tsx` | 52-53 | `"scored"`, `"in_progress"` | Badge color map |
| `lib/queries.ts` | 436 (comment) | `"new → queued → reviewed → used"` | Comment describes wrong flow |

**Verdict:** Any insert/update setting `status = 'scored'` or `status = 'in_progress'` will be **rejected by the DB CHECK constraint**. Queries filtering on these values will always return 0 rows. The admin Automation, Pipeline, and Social pages are structurally broken against the live schema.

#### MISMATCH 2 — `reviews.status`: "pending" NOT IN SCHEMA

**Schema allows:** `pending_review`, `approved`, `flagged`, `rejected`, `removed`

**Code references to INVALID value:**

| File | Line | Value Used | Context |
|------|------|-----------|---------|
| `app/admin/layout.tsx` | 57 | `"pending"` | `.eq("status", "pending")` — sidebar review count |
| `app/admin/page.tsx` | 35 | `"pending"` | `.eq("status", "pending")` — dashboard review count |
| `app/admin/reviews/ReviewsClient.tsx` | 41, 82, 180 | `"pending"` | Badge map, filter, count |

**Verdict:** The admin sidebar badge count for reviews and the ReviewsClient filter will always return 0 results. The correct value is `"pending_review"`.

#### MISMATCH 3 — `scripts.status`: "pending" NOT IN SCHEMA

**Schema allows:** `draft`, `approved`, `filmed`, `posted`, `killed`

**Code references to INVALID value:**

| File | Line | Value Used | Context |
|------|------|-----------|---------|
| `app/admin/scripts/page.tsx` | 23 | `"pending"` | `.in("status", ["draft", "pending"])` — query filter |
| `app/admin/scripts/page.tsx` | 79 | `"pending"` | `s.status === "draft" \|\| s.status === "pending"` — count |
| `app/admin/scripts/ScriptsClient.tsx` | 50 | `"pending"` | `statusBadgeMap` key |

**Verdict:** Any script with status `"pending"` cannot exist in the DB. The filter `.in("status", ["draft", "pending"])` will only ever match `"draft"` rows.

#### MISMATCH 4 — `scripts.status`: "published" NOT IN SCHEMA

**Schema allows:** `draft`, `approved`, `filmed`, `posted`, `killed`

| File | Line | Value Used | Context |
|------|------|-----------|---------|
| `app/admin/scripts/page.tsx` | 81 | `"published"` | `s.status === "posted" \|\| s.status === "published"` — count |

**Verdict:** `"published"` is not a valid scripts status. Only `"posted"` exists. The `counts.published` stat card may undercount.

### Schema Values Never Referenced in Code

| Table | Column | Unused Values |
|-------|--------|---------------|
| `stories` | `status` | `skipped`, `assigned_blog`, `assigned_script`, `assigned_dual`, `assigned_social`, `draft_script`, `draft_social`, `banked`, `discarded` — these are likely automation-pipeline values not yet wired |
| `scripts` | `status` | `filmed`, `killed` — never queried or written in app code |
| `blog_posts` | `status` | `ready_for_review`, `scheduled`, `archived` — never queried in app code |
| `newsletters` | `status` | `planning`, `draft`, `ready`, `scheduled`, `archived` — only `"sent"` is ever queried |
| `sponsors` | `status` | `prospect`, `paused`, `completed` — never filtered in public or admin queries currently visible |
| `system_logs` | `scenario` | `s3_scoring`, `s4_blog_gen`, `s5_script_gen`, `s6_social_gen`, `s8_publish`, `s10_analytics`, `s11_health_check`, `auth_refresh` — these are automation pipeline scenarios not yet wired |

**Note:** Unused schema values are expected for pre-automation tables. This is not a bug — it confirms the schema was designed ahead of implementation.

---

## 2) ADMIN WRITE PATH VALIDATION

### All Database Writes Found in Codebase

Only **one admin route** performs direct writes. All other admin pages are read-only.

| Route | Table Written | Column | Value | Valid in Schema? | Downstream Query Depends? | Risk |
|-------|---------------|--------|-------|-----------------|---------------------------|------|
| `app/admin/scripts/ScriptsClient.tsx:116` | `scripts` | `status` | `"approved"` | **YES** | Social queue queries `approved` scripts | **LOW** — value is valid |
| `app/admin/scripts/ScriptsClient.tsx:129` | `scripts` | `status` | `"approved"` | **YES** | Same — bulk-approves captions by story_id | **LOW** |
| `app/api/submit/route.ts:47` | `submissions` | `status` | `"pending"` | **YES** | Admin sidebar queries `status = 'pending'` | **LOW** |
| `app/api/webhooks/stripe/route.ts:67` | `submissions` | `status` | `"approved"` | **YES** | N/A | **LOW** |
| `app/api/webhooks/stripe/route.ts:84` | `business_listings` | `tier` | `"Free"` | **YES** | Hub pages filter by tier | **LOW** |
| `app/api/webhooks/stripe/route.ts:84` | `business_listings` | `map_pin_style` | `"gray"` | **YES** | Map pin rendering | **LOW** |
| `app/api/webhooks/stripe/route.ts:98` | `subscriptions` | `status` | `"past_due"` | **YES** | N/A | **LOW** |

### Stub/Non-Functional Admin Writes

| Route | Action | Issue |
|-------|--------|-------|
| `ScriptsClient.tsx:259` | "Reject" button | `console.log` only — **no DB write** |
| `ScriptsClient.tsx:335` | "Save" edit modal | `console.log` only — **no DB write** |

**Summary:** All actual writes use valid schema values. The two stub buttons (Reject, Save Edit) are non-functional placeholders.

---

## 3) RLS & CLIENT STRATEGY CHECK

### Client Configuration

| Client | Key Used | Defined In | Auth State |
|--------|----------|------------|------------|
| `createServerClient()` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase.ts:19-25` | **Unauthenticated** (`persistSession: false`) |
| `createBrowserClient()` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase.ts:30-34` | Browser session (if user logged in) |
| Stripe webhook client | `SUPABASE_SERVICE_ROLE_KEY` | `app/api/webhooks/stripe/route.ts:50` | **Service role — bypasses RLS** |

### RLS Status

RLS is **ENABLED** on all tables (confirmed via `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements in schema-dump.sql).

### Policy Analysis for Key Tables

| Table | Public Read Policy | Condition | Admin Policy |
|-------|-------------------|-----------|--------------|
| `blog_posts` | "Public can read published blog posts" | `status = 'published'` | `is_admin_or_editor()` |
| `business_listings` | "Public can read active business listings" | `status = 'active'` | `is_admin_or_editor()` |
| `events` | (not found — **RISK**) | — | `is_admin_or_editor()` |
| `reviews` | "Public can read approved reviews" | `status = 'approved'` | `is_admin_or_editor()` |
| `stories` | "Public read on stories" | `USING (true)` — open | `is_admin_or_editor()` |
| `scripts` | "Public read on scripts" | `USING (true)` — open | `is_admin_or_editor()` |
| `neighborhoods` | (not found — **RISK**) | — | `is_admin_or_editor()` |
| `areas` | (not found — **RISK**) | — | `is_admin_or_editor()` |
| `categories` | (not found — **RISK**) | — | `is_admin_or_editor()` |

### RISK: Admin Pages Use Anon Key Without Auth

**All admin server pages** (`app/admin/*/page.tsx`) call `createServerClient()` which uses the **anon key with no auth context**. The admin read policies require `is_admin_or_editor()` which checks `auth.uid()` against the users table.

**For tables WITH a public read policy** (blog_posts, business_listings, reviews, stories, scripts): anon queries work but are scoped to the public policy (e.g., only `status = 'published'` for blog_posts). Admin pages querying all statuses would only see the public subset.

**For tables WITHOUT a public read policy** (events, neighborhoods, areas, categories — not confirmed): If no permissive `USING (true)` policy exists, these queries return **empty results**.

**Impact:** The admin CMS likely returns incomplete or empty data on tables where admin-only read policies are the only SELECT policies. This does not break the public site but **does break admin functionality**.

### RISK: ScriptsClient.tsx Writes via Browser Client

`ScriptsClient.tsx:111` calls `createBrowserClient()` for `.update()` calls on the `scripts` table. The update policy requires `is_admin_or_editor()`. If the logged-in browser user is not recognized as admin/editor by the `is_admin_or_editor()` function, **the write will silently fail** (Supabase returns no error on RLS-blocked updates, just 0 rows affected).

### Summary

| Risk | Description |
|------|-------------|
| **HIGH** | Admin server pages use anon key — no auth context passed to Supabase |
| **HIGH** | ScriptsClient writes via browser client — depends on user having admin role |
| **MEDIUM** | No service-role client exists for admin server-side operations |
| **LOW** | Stripe webhook correctly uses service-role key |
| **SAFE** | Public pages query only `published`/`active` rows — matches RLS public policies |

---

## 4) API ROUTE VALIDATION

### `POST /api/submit` — Submission Intake

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Create new business/event submission |
| **Table written** | `submissions` |
| **Columns written** | `submission_type`, `submitter_name`, `submitter_email`, `data`, `status`, `updated_at` |
| **Status value** | `"pending"` — **VALID** in schema |
| **Validation** | Checks required fields, validates `submission_type ∈ ['business', 'event']`, basic email check |
| **Error handling** | Full try/catch, returns 400/500 |
| **Client** | `createServerClient()` (anon key) |
| **RLS risk** | Insert requires `is_admin_or_editor()` — **anon insert will be blocked by RLS** |
| **Status** | **PARTIALLY BROKEN** — form submits will fail silently under RLS unless a public insert policy exists |

### `POST /api/submit/create-checkout` — Stripe Checkout

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Create Stripe Checkout session for paid submissions |
| **Table written** | None (Stripe API only) |
| **Validation** | Checks `STRIPE_SECRET_KEY`, price lookup |
| **Error handling** | Full — 503 for missing config, 400 for missing price |
| **Status** | **IMPLEMENTED** — no DB risk |

### `POST /api/webhooks/stripe` — Stripe Webhook Handler

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Handle checkout completion, subscription deletion, payment failure |
| **Tables written** | `submissions`, `business_listings`, `subscriptions` |
| **Columns written** | `submissions.status` → `"approved"`, `business_listings.tier` → `"Free"`, `business_listings.map_pin_style` → `"gray"`, `subscriptions.status` → `"past_due"` |
| **All values valid?** | **YES** — all match schema constraints |
| **Client** | Service-role key — **bypasses RLS correctly** |
| **Validation** | Stripe signature verification, env var checks |
| **Error handling** | Full |
| **Status** | **IMPLEMENTED AND SAFE** |

### `POST /api/upload` — Image Upload

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Upload image to Supabase Storage |
| **Table written** | None (Storage bucket only) |
| **Client** | `createServerClient()` (anon key) |
| **Validation** | Checks file exists |
| **Error handling** | Returns 400/500 |
| **RLS risk** | Depends on storage bucket policy for `site-images` |
| **Status** | **IMPLEMENTED** — storage policy not auditable from schema-dump |

### Stub Detection

| Route | Referenced in UI? | Status |
|-------|-------------------|--------|
| All 4 API routes are implemented | Yes | No stubs found in API layer |
| `ScriptsClient` Reject button | Yes (visible in admin) | **STUB** — `console.log` only |
| `ScriptsClient` Save Edit button | Yes (visible in admin) | **STUB** — `console.log` only |

---

## 5) DEAD CODE & MISMATCH DETECTION

### Status Values in Code Comments Not Matching Schema

| File | Comment | Schema Reality |
|------|---------|----------------|
| `lib/queries.ts:436` | `"new → queued → reviewed → used"` | Schema: `new, reviewed, queued, skipped, assigned_*, draft_*, banked, used, discarded` — comment omits most statuses and shows wrong order |

### Scenario Names in Docs Not in Schema

The `system_logs.scenario` constraint includes: `s1_intake`, `s3_scoring`, `s4_blog_gen`, `s5_script_gen`, `s6_social_gen`, `s8_publish`, `s10_analytics`, `s11_health_check`, `auth_refresh`, `manual`.

**Notable gaps:** `s2_*`, `s7_*`, `s9_*` are missing from the constraint. If automation scenarios are numbered sequentially, these gaps may indicate planned but unregistered scenarios.

No code currently writes to `system_logs` — this table is entirely for future automation pipeline use.

### Broken Links (Routes Referenced But Don't Exist)

| Source File | Link Target | Issue |
|-------------|-------------|-------|
| `components/dashboard/PlanBillingClient.tsx:145` | `/partners` | Should be `/partner` (singular) |
| `app/admin/areas/AreasClient.tsx:74` | `/admin/areas/new` | No "new" route exists |
| `app/admin/events/EventsClient.tsx:135` | `/admin/events/new` | No "new" route exists |
| `app/admin/businesses/BusinessesClient.tsx:141` | `/admin/businesses/new` | No "new" route exists |
| `app/admin/beyond-atl/BeyondATLClient.tsx:75` | `/admin/beyond-atl/new` | No "new" route exists |
| `app/(public)/partner/marketing/page.tsx:371` | `/partner/case-studies/inked-by-j` | No case study routes exist |
| `app/(public)/partner/editorial/page.tsx:348` | `/partner/case-studies/smorgasburg` | No case study routes exist |

### Orphaned Admin Sidebar Links (Navigation Links to Non-Existent Pages)

| Source | Link Target | Issue |
|--------|-------------|-------|
| `app/admin/layout.tsx:128` | `/admin/maps` | Page does not exist |
| `app/admin/layout.tsx:130` | `/admin/import-export` | Page does not exist |

### Missing "Create New" Admin Pages

The admin CRUD pattern has edit pages (`/admin/[resource]/[id]`) but no create pages (`/admin/[resource]/new`) for: areas, events, businesses, beyond-atl cities.

---

## 6) STRUCTURAL RISK SUMMARY

### HIGH RISK — Must Fix Before Automation Work

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| **H1** | `stories.status` values `"scored"` and `"in_progress"` are not in schema CHECK constraint | Admin Automation, Pipeline, Social pages query phantom values — always return 0 results. Any automation writing these values will fail at DB level. | Add `scored` and `in_progress` to `stories_status_check` constraint, OR update code to use existing schema values |
| **H2** | `reviews.status` value `"pending"` is not in schema (should be `"pending_review"`) | Admin sidebar review count always shows 0. Review moderation queue appears empty. | Change code from `"pending"` to `"pending_review"` in admin layout, dashboard, and ReviewsClient |
| **H3** | `scripts.status` value `"pending"` is not in schema | Scripts page filter includes phantom value. Not blocking (falls back to `"draft"`), but indicates schema/code drift. | Remove `"pending"` from code filters, OR add to schema if automation needs it |
| **H4** | Admin server pages use anon key with no auth context | Admin CMS reads may return incomplete/empty data for tables with admin-only RLS policies. Admin writes from browser client may silently fail. | Implement authenticated server client for admin routes (pass cookies/session), OR create a service-role admin client |
| **H5** | `/api/submit` inserts via anon key — RLS blocks anonymous inserts on `submissions` | Public submission form is non-functional under RLS | Add public insert policy for `submissions`, OR use service-role client for this API route |

### MEDIUM RISK

| # | Issue | Impact |
|---|-------|--------|
| **M1** | 4 admin "Add New" buttons link to non-existent `/new` routes (areas, events, businesses, beyond-atl) | Admin users hit 404 when trying to create new records |
| **M2** | 2 admin sidebar links point to non-existent pages (`/admin/maps`, `/admin/import-export`) | Admin users hit 404 |
| **M3** | `sponsor_deliverables.status` has no CHECK constraint (only a comment) | No DB-level enforcement of `active/completed/paused` — any string can be inserted |
| **M4** | `scripts.status` value `"published"` used in count logic but not in schema (correct value: `"posted"`) | Published script count may undercount on stat cards |
| **M5** | ScriptsClient "Reject" and "Save Edit" buttons are stubs (`console.log` only) | Admin users see functional-looking buttons that do nothing |
| **M6** | `/partners` link in dashboard should be `/partner` | Dashboard users get 404 on "Explore Partnerships" |
| **M7** | Partner case study links (`/partner/case-studies/*`) point to non-existent routes | Partner marketing pages have dead links |

### SAFE AREAS

| Area | Status |
|------|--------|
| **Public site queries** (`lib/queries.ts`) | All status filters use valid schema values (`published`, `active`, `approved`, `sent`). Structurally sound. |
| **Stripe webhook writes** | All values valid, uses service-role key, proper signature verification |
| **Blog post status flow** | `published` used consistently in queries and RLS policies |
| **Business listing status flow** | `active` used consistently; tier values (`Free`, `Standard`, `Premium`) match schema |
| **Event queries** | `active` status used consistently and matches schema |
| **Newsletter queries** | `sent` status used consistently and matches schema |
| **Supabase schema design** | CHECK constraints are comprehensive and well-structured. Schema is automation-ready. |
| **Hub archive pages** | Complex query logic is sound — filters, joins, and dedup logic all correct |
| **Search functionality** | Global search queries use correct status filters |

---

## DETERMINATION

> **System contains blocking inconsistencies.**

The codebase has **5 high-risk structural issues** that will cause failures or silent data loss when automation pipelines begin writing to `stories`, `scripts`, `reviews`, and `submissions` tables.

**The public-facing site is structurally stable.** All public queries use valid status values and align with RLS public-read policies.

**The admin CMS has structural drift.** Status values in admin code do not match the schema CHECK constraints for stories, reviews, and scripts. The RLS + anon-key strategy means admin pages may already be returning incomplete data.

**Before proceeding with automation work, fix H1-H5.** The schema is well-designed and automation-ready — the code simply needs to be reconciled with it.

---

*End of audit. No redesign, no architecture expansion, no recommendations beyond structural integrity.*
