# ATL Vibes & Views — Full-Site Forensic Audit

**Audit Date:** February 16, 2026
**Branch:** `claude/full-site-forensic-audit-UFupM`
**Scope:** Complete Next.js App Router codebase — public pages, admin portal, business dashboard

---

## Table of Contents

1. [Route Inventory](#1-route-inventory)
2. [Clickable Surface Audit](#2-clickable-surface-audit)
3. [Mobile Optimization Audit](#3-mobile-optimization-audit)
4. [Data Mapping, State Management & Integrations](#4-data-mapping-state-management--integrations)
5. [SEO & Accessibility Baseline](#5-seo--accessibility-baseline)
6. [Ad Slot Verification](#6-ad-slot-verification)
7. [Hero Media & Placeholder Coverage](#7-hero-media--placeholder-coverage)
8. [Consolidated Priority Matrix](#8-consolidated-priority-matrix)

---

## 1. Route Inventory

**Total routes: 89 page.tsx files**

### Public Routes — `app/(public)/` (41 routes)

| Path | Type | Component | Notes |
|------|------|-----------|-------|
| `/` | Static | Server | Homepage — featured stories, editor's picks, video module |
| `/about` | Static | Server | About page with founder info |
| `/areas` | Static | Server | Geographic areas landing |
| `/areas/[slug]` | Dynamic | Server | Area detail with neighborhoods, stories, eats, events |
| `/beyond-atl` | Static | Server | Beyond ATL cities landing |
| `/beyond-atl/[slug]` | Dynamic | Server | City detail (outside Atlanta) |
| `/city-watch` | Static | Server | News archive with category/area/neighborhood filtering |
| `/contact` | Static | Server | Contact page with form + office info |
| `/cookies` | Static | Server | Cookie policy |
| `/disclaimer` | Static | Server | Legal disclaimer |
| `/events` | Static | Server | Redirect → `/hub/events` |
| `/events/[slug]` | Dynamic | Server | Event detail page |
| `/hub/atlanta-guide` | Static | Server | Atlanta guide (StoriesArchiveClient) |
| `/hub/businesses` | Static | Server | Business directory hub |
| `/hub/eats-and-drinks` | Static | Server | Dining hub |
| `/hub/events` | Static | Server | Events archive with map + filtering |
| `/hub/things-to-do` | Static | Server | Activities hub |
| `/login` | Static | **Client** | Email/password + Google OAuth |
| `/media` | Static | Server | Media/video library landing |
| `/media/[slug]` | Dynamic | Server | Individual media detail |
| `/media/library` | Static | Server | Media library archive |
| `/neighborhoods` | Static | Server | Neighborhoods landing |
| `/neighborhoods/[slug]` | Dynamic | Server | Neighborhood detail (3-tier fallback) |
| `/newsletters` | Static | Server | Newsletter archive |
| `/newsletters/[slug]` | Dynamic | Server | Individual newsletter issue |
| `/partner` | Static | Server | Sponsorship/partnership landing |
| `/partner/about` | Static | Server | Partner about |
| `/partner/contact` | Static | Server | Partner contact |
| `/partner/editorial` | Static | Server | Editorial partnerships |
| `/partner/events` | Static | Server | Partner events |
| `/partner/marketing` | Static | Server | Marketing partnerships |
| `/places/[slug]` | Dynamic | Server | Business detail page |
| `/privacy` | Static | Server | Privacy policy |
| `/signup` | Static | **Client** | Email/password + Google OAuth |
| `/stories/[slug]` | Dynamic | Server | Blog post/story detail |
| `/submit` | Static | Server | Multi-step submission wizard |
| `/submit/canceled` | Static | Server | Submission canceled |
| `/submit/success` | Static | **Client** | Submission success |
| `/terms` | Static | Server | Terms & conditions |
| `/things-to-do/[slug]` | Dynamic | Server | Activity detail |
| `/not-found` | Static | Server | 404 page |

### Admin Portal — `app/admin/` (34 routes)

| Path | Type | Notes |
|------|------|-------|
| `/admin` | Static | Dashboard with stats, alerts, activity feed |
| `/admin/ad-placements` | Static | Ad placement management |
| `/admin/analytics` | Static | Analytics dashboard |
| `/admin/areas` | Static | Area management |
| `/admin/areas/[id]` | Dynamic | Edit area |
| `/admin/automation` | Static | Automation management |
| `/admin/beyond-atl` | Static | Beyond ATL management |
| `/admin/beyond-atl/[id]` | Dynamic | Edit city |
| `/admin/businesses` | Static | Business listings |
| `/admin/businesses/[id]` | Dynamic | Edit business |
| `/admin/calendar` | Static | Editorial calendar |
| `/admin/categories` | Static | Category management |
| `/admin/events` | Static | Events management |
| `/admin/events/[id]` | Dynamic | Edit event |
| `/admin/media` | Static | Media library management |
| `/admin/media/new` | Static | Add new media |
| `/admin/neighborhoods` | Static | Neighborhood management |
| `/admin/neighborhoods/[id]` | Dynamic | Edit neighborhood |
| `/admin/newsletters` | Static | Newsletter management |
| `/admin/pipeline` | Static | Content pipeline/approval |
| `/admin/posts` | Static | Blog posts management |
| `/admin/publishing` | Static | Publishing queue |
| `/admin/revenue` | Static | Revenue/sponsorship dashboard |
| `/admin/reviews` | Static | Review moderation |
| `/admin/scripts` | Static | Script management |
| `/admin/settings` | Static | Admin settings |
| `/admin/social` | Static | Social media management |
| `/admin/social/distribute/[id]` | Dynamic | Distribute content to social |
| `/admin/sponsors` | Static | Sponsor management |
| `/admin/sponsors/[id]` | Dynamic | Edit sponsor |
| `/admin/sponsors/creatives` | Static | Creative assets |
| `/admin/sponsors/packages` | Static | Sponsorship packages |
| `/admin/submissions` | Static | User submissions review |
| `/admin/tags` | Static | Tag management |
| `/admin/users` | Static | User management |

### Business Owner Dashboard — `app/dashboard/` (9 routes)

| Path | Type | Notes |
|------|------|-------|
| `/dashboard` | Static | Overview with stats, sponsor info, reviews |
| `/dashboard/analytics` | Static | Business analytics |
| `/dashboard/billing` | Static | Plan & billing management |
| `/dashboard/events` | Static | Business events management |
| `/dashboard/listing` | Static | Listing management |
| `/dashboard/reviews` | Static | Review management |
| `/dashboard/settings` | Static | Account settings |
| `/dashboard/sponsorship` | Static | Sponsorship deliverables |
| `/dashboard/stories` | Static | Stories about the business |

### Architecture Summary
- **Server Components:** 86 page.tsx files (default)
- **Client Components:** 3 page.tsx files (`/login`, `/signup`, `/submit/success`)
- **Pattern:** Server Components fetch data → pass props to Client sub-components for interactivity

---

## 2. Clickable Surface Audit

### External API Calls Triggered by User Interaction

| Endpoint | Method | Trigger | Location |
|----------|--------|---------|----------|
| HubSpot Forms API | POST | Newsletter signup | `NewsletterForm.tsx` |
| HubSpot Forms API | POST | Contact form submit | `GeneralContactForm.tsx` |
| HubSpot Forms API | POST | Partner inquiry submit | `PartnerContactForm.tsx` |
| `POST /api/submit` | POST | Business/event listing submit | `SubmitClient.tsx` |
| `POST /api/submit/create-checkout` | POST | Paid tier checkout | `SubmitClient.tsx` |
| `POST /api/upload` | POST | Image upload | `SubmitClient.tsx` |
| Supabase Auth | POST | Login/signup/password reset | `login/page.tsx`, `signup/page.tsx` |
| Web Share API | — | Share listing | `BusinessDetailClient.tsx` |

### Form Inventory (7 forms)

| Form | Location | Handler | Validation |
|------|----------|---------|------------|
| Newsletter (inline) | `NewsletterForm.tsx` | HubSpot direct POST | Email required |
| Newsletter (block) | `NewsletterBlock.tsx` | HubSpot direct POST | Email required |
| Footer newsletter | `Footer.tsx` | Local state (TODO) | Email required |
| General contact | `GeneralContactForm.tsx` | `submitHubSpotForm()` | 3 required fields |
| Partner contact | `PartnerContactForm.tsx` | `submitHubSpotForm()` | 4 required fields |
| Business submission | `BusinessForm.tsx` | `/api/submit` | Multi-field |
| Event submission | `EventForm.tsx` | `/api/submit` | Multi-field |

### Key Interactive Components

| Component | Interactions | Notes |
|-----------|-------------|-------|
| **Header** | Search toggle, navigation dropdowns (Explore ATL, The Hub, Beyond ATL), mobile drawer, social links | `useState` for drawer/dropdown/search state |
| **SearchBar** | Form submit → URL params `?q=` | Client-side routing only |
| **SaveButton** | Toggle heart icon | Local `saved` state only (no persistence) |
| **MediaKitModal** | Open/close modal with PDF iframe | React Context + `useState` |
| **SubmitClient** | 5-step wizard (type → pricing → form → review → confirm) | Complex multi-step state |
| **BusinessDetailClient** | Share, write review, image carousel, social links | Multiple `useState` hooks |
| **EventsClient** | Search, filter dropdowns (areas, categories, types), map, pagination | URL param routing + local state |

### Navigation Links Summary
- **Header:** 5 top-level nav items + mega-menu with ~50 area/neighborhood links + 5 Hub links + 9 Beyond ATL city links
- **Footer:** 5 neighborhood links + 5 explore links + 5 company links + 5 social links
- **Sidebar widgets:** Newsletter, Ad, Neighborhoods, Submit CTAs

---

## 3. Mobile Optimization Audit

### Breakpoint Usage: GOOD
- Consistent mobile-first Tailwind: `sm:`, `md:`, `lg:`, `xl:` throughout
- Grid layouts properly transition: 1-col → 2-col → 3+ col
- Text sizing scales: e.g. `text-2xl sm:text-3xl md:text-5xl lg:text-6xl`

### Mobile Navigation: EXCELLENT
- Hamburger menu with full-height drawer (`w-[340px]`, fixed, z-50)
- Smooth slide animation with backdrop overlay
- Accordion sections for nested navigation (Explore ATL, The Hub, Beyond ATL)
- Body scroll lock when drawer open

### Touch Target Sizes: NEEDS ATTENTION
| Element | Current Size | Target | Status |
|---------|-------------|--------|--------|
| Icon buttons (search, login, menu) | ~35-37px (`p-2.5`) | 44px min | **Below minimum** |
| SearchBar clear button | ~20px (`p-1`) | 44px min | **Too small** |
| CTA buttons | 40-48px (`py-3`) | 44px min | OK |
| Mobile menu items | ~48px (`py-3`) | 44px min | OK |

### Client Portal Header Link: NOT PRESENT
- No "Client Portal" navigation link exists in the Header component
- Not found in desktop nav, mobile drawer, or anywhere in the codebase

### Viewport Meta Tag: PRESENT (Implicit)
- Next.js 13+ automatically injects `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Not explicitly declared in `app/layout.tsx`

### Horizontal Scrolling: LOW RISK
- All `overflow-x-auto` usages are intentional and properly scoped (carousels, data tables)
- Negative margin technique (`-mx-4 px-4`) prevents layout overflow

### Header Height on Mobile
- Brand bar: 84px + Nav bar: 60px = **144px total** (28% of 512px viewport)
- Consider condensing on mobile

---

## 4. Data Mapping, State Management & Integrations

### Supabase Data Layer
- **Client:** `lib/supabase.ts` — Server client (SSR) + Browser client (singleton)
- **Queries:** `lib/queries.ts` — 1,686 lines, 100+ query functions
- **Tables referenced:** 47+ tables including `blog_posts`, `business_listings`, `events`, `neighborhoods`, `areas`, `categories`, `authors`, `media_items`, `newsletters`, `sponsors`, `ad_placements`, `submissions`

### State Management
- **Pattern:** Minimal — React `useState` / `useCallback` only
- **Context:** 1 instance — `MediaKitContext` for partner pages
- **No external libraries:** No Zustand, Redux, Jotai, TanStack Query, or SWR

### API Routes (4 total)

| Route | Status | Purpose |
|-------|--------|---------|
| `POST /api/submit` | **Working** | Create business/event submissions |
| `POST /api/upload` | **Working** | Upload images to Supabase Storage |
| `POST /api/submit/create-checkout` | **Stub** | Stripe checkout session (not implemented) |
| `POST /api/webhooks/stripe` | **Stub** | Stripe webhook handler (not implemented) |

### Server Actions
- **None found** — project uses API routes exclusively

### Make.com Integration
- **Reference:** `DistributeClient.tsx` — "S9" scenario for multi-platform social distribution
- **Status:** **NOT IMPLEMENTED** — button click only logs to console
- No webhook URL configured, no HTTP request, no error handling

### HubSpot Integration
- **Library:** `lib/hubspot.ts` — `submitHubSpotForm()` utility
- **Portal ID:** 244168309
- **Forms:** Newsletter (hardcoded form ID), Contact (env var), Partner (env var)
- **Status:** **Working**

### Environment Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | Public | HubSpot workspace ID |
| `NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID` | Public | Contact form ID |
| `NEXT_PUBLIC_HUBSPOT_PARTNER_FORM_ID` | Public | Partner form ID |
| `STRIPE_WEBHOOK_SECRET` | Private | Stripe webhook verification (pending) |

### Incomplete Implementations

| Feature | Location | What's Missing |
|---------|----------|---------------|
| Stripe checkout | `/api/submit/create-checkout` | Customer management, pricing lookup, session creation |
| Stripe webhooks | `/api/webhooks/stripe` | Signature verification, event handling, subscription management |
| Make.com S9 | `DistributeClient.tsx` | Webhook URL, HTTP request, error handling |
| Email notifications | `/api/submit` | Confirmation emails, admin alerts |
| Footer newsletter | `Footer.tsx` | Form handler (currently local state only) |
| SaveButton persistence | `SaveButton.tsx` | Backend storage (currently local state only) |

---

## 5. SEO & Accessibility Baseline

### Metadata Coverage

**Root layout** (`app/layout.tsx`):
- Title template: `%s | ATL Vibes & Views`
- Default title, description, openGraph (type, locale, siteName)
- `<html lang="en">` set correctly

**Pages WITH complete metadata** (title + description + openGraph): 15 pages
- About, Stories, Stories/[slug], City Watch, Contact, Newsletters, Newsletters/[slug], Media, Media/[slug], Media Library, Hub: Atlanta Guide, Hub: Newsletters, Submit, Places/[slug], Things-to-Do/[slug]

**Pages WITH title + description BUT MISSING page-specific openGraph**: 13 pages
- Areas, Beyond ATL, Beyond ATL/[slug], Privacy, Terms, Cookies, Disclaimer, Partner (and 5 partner sub-pages)

**Pages MISSING metadata entirely**: 11 pages (P2 severity)

| Page | File |
|------|------|
| **Homepage** | `app/(public)/page.tsx` |
| Login | `app/(public)/login/page.tsx` |
| Signup | `app/(public)/signup/page.tsx` |
| Events/[slug] | `app/(public)/events/[slug]/page.tsx` |
| Areas/[slug] | `app/(public)/areas/[slug]/page.tsx` |
| Neighborhoods/[slug] | `app/(public)/neighborhoods/[slug]/page.tsx` |
| Hub: Businesses | `app/(public)/hub/businesses/page.tsx` |
| Hub: Eats & Drinks | `app/(public)/hub/eats-and-drinks/page.tsx` |
| Hub: Events | `app/(public)/hub/events/page.tsx` |
| Hub: Things to Do | `app/(public)/hub/things-to-do/page.tsx` |
| Submit Success | `app/(public)/submit/success/page.tsx` |

### Heading Hierarchy: GOOD
- Every page has exactly 1 H1 (some via shared components like `HeroSection`)
- No heading level skips found (H1 → H2 → H3 → H4)
- Homepage has 2 H1s but they're mutually exclusive (ternary rendering)

### Accessibility Blockers (P1)

**Inputs missing labels/aria-label (5 instances):**
1. `NewsletterForm.tsx` — email input, no label or aria-label
2. `NewsletterBlock.tsx` — email input, no label or aria-label
3. `Footer.tsx` — email input, no label or aria-label
4. `Header.tsx` — search input, no label or aria-label
5. `LocationDetailContent.tsx` — email input, no label or aria-label

**Icon-only buttons missing aria-label (2 instances):**
6. `Header.tsx:150` — close search button (X icon)
7. `Header.tsx:285-294` — close drawer button (X icon)

**Iframes missing title attribute (4 instances):**
8. `things-to-do/[slug]/page.tsx` — YouTube iframe
9. `things-to-do/[slug]/page.tsx` — Vimeo iframe
10. `places/[slug]/page.tsx` — YouTube iframe
11. `places/[slug]/page.tsx` — Vimeo iframe

**Focus management issues (3 locations):**
12. `GeneralContactForm.tsx` — `focus:outline-none` without adequate replacement
13. `PartnerContactForm.tsx` — `focus:outline-none` without adequate replacement
14. `Header.tsx:149` — search input `outline-none` with no replacement

### Accessibility Warnings (P3)
- 13 pages with metadata but no page-specific openGraph
- `GeneralContactForm` and `PartnerContactForm` labels not associated via `htmlFor`/`id`
- Low-contrast text: `text-white/40`, `text-white/30` on dark backgrounds (requires visual verification)
- Most buttons/links lack explicit `focus-visible:` styles (rely on browser defaults)
- Admin `<img>` tags with empty alt text (not public-facing)

### Images: EXCELLENT (public pages)
- Zero raw `<img>` tags on public pages — all use `next/image`
- All `next/image` usages have `alt` attributes
- Raw `<img>` tags exist only in admin pages (10 instances, P3)
- Note: Nearly all public `next/image` components use `unoptimized` prop (disables optimization)

---

## 6. Ad Slot Verification

### Ad Components (2 components)

**`AdBlock`** (`components/ui/AdBlock.tsx`):
- 3 variants: `sidebar` (250px), `horizontal` (120px), `inline` (CTA link)
- All are **placeholders** — styled divs with "Advertise Here" text
- Not connected to any ad network

**`AdPlacement`** (`components/Sidebar.tsx`):
- 2 slots: `sidebar_top` → links to `/hub/businesses`, `sidebar_mid` → links to `/hub/events`
- 300×250px placeholder squares

### Placement Distribution (29 instances)

| Location | Component | Variant | Count |
|----------|-----------|---------|-------|
| Hub pages (3 pages) | AdBlock | sidebar | 3 |
| HubArchiveClient | AdBlock | inline + horizontal | 2 |
| Areas/[slug] | AdBlock + AdPlacement | inline + sidebar_top | 2 |
| AreaLandingContent | AdPlacement | sidebar_top + sidebar_mid | 2 |
| LocationDetailContent | AdBlock + AdPlacement | inline + sidebar_top | 3 |
| Stories/[slug] | AdPlacement | sidebar_top + sidebar_mid | 3 |
| Newsletters/[slug] | AdPlacement | sidebar_top | 1 |
| Media/[slug] | AdPlacement | sidebar_top | 1 |
| MediaLandingClient | AdBlock | inline | 1 |
| MediaLibraryClient | AdBlock | inline | 1 |
| StoriesArchiveClient | AdBlock | inline | 1 |
| Homepage | AdPlacement | sidebar_top | 1 |
| Hub: Events | AdBlock | inline + horizontal | 2+ |

### Sponsor/Partnership Infrastructure

| Component | Purpose | Status |
|-----------|---------|--------|
| `SponsorDashboard` | Active sponsor dashboard | Functional |
| `SponsorUpsell` | Marketing component for upgrades | Functional |
| `SponsorshipClient` | Routes sponsor vs. upsell content | Functional |
| Admin: Ad Placements | CRUD for `ad_placements` table | Functional |
| Admin: Sponsors | Sponsor management + packages + creatives | Functional |

### Key Finding
**No external ad networks are integrated.** All ad slots are placeholder components. The sponsor/partnership infrastructure (database tables, admin UI, dashboard) is fully built and ready for monetization, but no programmatic ads (AdSense, Ad Manager) are served.

---

## 7. Hero Media & Placeholder Coverage

### Hero Section Component
- **File:** `components/ui/HeroSection.tsx`
- **Variants:** `split` (2-column grid) and `overlay` (full-width with gradient)
- **Missing:** No built-in fallback image, no skeleton loader, no error boundary

### Coverage by Page

| Page | Hero Type | Image Fallback | Video | Status |
|------|-----------|---------------|-------|--------|
| `/` (home) | Custom | Local `/images/default-hero.png` + text fallback | No | **EXCELLENT** |
| `/hub/businesses` | HeroSection | Local `/images/default-hero.png` | No | GOOD |
| `/hub/eats-and-drinks` | HeroSection | Local `/images/default-hero.png` | No | GOOD |
| `/hub/things-to-do` | HeroSection | Local `/images/default-hero.png` | No | GOOD |
| `/hub/events` | Custom | Local `/images/default-hero.png` | No | GOOD |
| `/hub/atlanta-guide` | StoriesArchiveClient | placehold.co (external) | No | FAIR |
| `/stories` | StoriesArchiveClient | placehold.co (external) | No | FAIR |
| `/stories/[slug]` | Custom | placehold.co (external) | No | FAIR |
| `/neighborhoods` | Custom | placehold.co (external) | Yes (native video) | GOOD |
| `/neighborhoods/[slug]` | Custom | placehold.co (external) | Yes (multi-tier) | EXCELLENT |
| `/areas/[slug]` | Custom | placehold.co (external) | No | FAIR |
| `/events/[slug]` | Custom | placehold.co (external) | No | FAIR |
| `/media` | MediaLandingClient | placehold.co + YouTube thumbnails | Yes | GOOD |
| `/about` | Custom | **NO FALLBACK** (hardcoded Unsplash URL) | No | **NEEDS FIX** |
| `/contact` | Custom | **NO FALLBACK** (hardcoded Unsplash URL) | No | **NEEDS FIX** |

### Placeholder Sources

| Source | Usage | Risk |
|--------|-------|------|
| `/images/default-hero.png` | Hub pages, homepage | Low (local asset) |
| `placehold.co` | Detail pages, archives | Medium (external dependency) |
| `images.unsplash.com` | About, Contact pages | **High** (no fallback, external) |
| `img.youtube.com/vi/` | Video thumbnails | Low (reliable) |

### Missing Features
- No skeleton loaders for any hero sections
- No `onError` handler on Image components
- No `blurDataURL` for smooth loading transitions
- About and Contact pages have no fallback if Unsplash is unavailable

---

## 8. Consolidated Priority Matrix

### P1 — Critical (14 issues)

| # | Category | Issue | File(s) |
|---|----------|-------|---------|
| 1 | A11y | Newsletter email input missing label | `NewsletterForm.tsx` |
| 2 | A11y | NewsletterBlock email input missing label | `NewsletterBlock.tsx` |
| 3 | A11y | Footer email input missing label | `Footer.tsx` |
| 4 | A11y | Header search input missing label | `Header.tsx` |
| 5 | A11y | LocationDetailContent email input missing label | `LocationDetailContent.tsx` |
| 6 | A11y | Close search button missing aria-label | `Header.tsx:150` |
| 7 | A11y | Close drawer button missing aria-label | `Header.tsx:285` |
| 8 | A11y | YouTube iframe missing title | `things-to-do/[slug]/page.tsx` |
| 9 | A11y | Vimeo iframe missing title | `things-to-do/[slug]/page.tsx` |
| 10 | A11y | YouTube iframe missing title | `places/[slug]/page.tsx` |
| 11 | A11y | Vimeo iframe missing title | `places/[slug]/page.tsx` |
| 12 | A11y | `focus:outline-none` without replacement focus indicator | `GeneralContactForm.tsx`, `PartnerContactForm.tsx`, `Header.tsx` |
| 13 | Mobile | Touch targets below 44px minimum | Icon buttons in `Header.tsx`, `SearchBar.tsx` |
| 14 | Hero | No fallback image on About and Contact pages | `about/page.tsx`, `contact/page.tsx` |

### P2 — High (15 issues)

| # | Category | Issue | File(s) |
|---|----------|-------|---------|
| 15 | SEO | Homepage missing all metadata | `app/(public)/page.tsx` |
| 16 | SEO | Events/[slug] missing metadata | `app/(public)/events/[slug]/page.tsx` |
| 17 | SEO | Areas/[slug] missing metadata | `app/(public)/areas/[slug]/page.tsx` |
| 18 | SEO | Neighborhoods/[slug] missing metadata | `app/(public)/neighborhoods/[slug]/page.tsx` |
| 19 | SEO | Hub: Businesses missing metadata | `app/(public)/hub/businesses/page.tsx` |
| 20 | SEO | Hub: Eats & Drinks missing metadata | `app/(public)/hub/eats-and-drinks/page.tsx` |
| 21 | SEO | Hub: Events missing metadata | `app/(public)/hub/events/page.tsx` |
| 22 | SEO | Hub: Things to Do missing metadata | `app/(public)/hub/things-to-do/page.tsx` |
| 23 | SEO | Login page missing metadata | `app/(public)/login/page.tsx` |
| 24 | SEO | Signup page missing metadata | `app/(public)/signup/page.tsx` |
| 25 | Integration | Stripe checkout not implemented | `/api/submit/create-checkout` |
| 26 | Integration | Stripe webhooks not implemented | `/api/webhooks/stripe` |
| 27 | Integration | Make.com S9 webhook not implemented | `DistributeClient.tsx` |
| 28 | Integration | Footer newsletter form not connected | `Footer.tsx` |
| 29 | Feature | "Client Portal" header link missing | `Header.tsx` |

### P3 — Medium (20+ issues)

| # | Category | Issue |
|---|----------|-------|
| 30 | SEO | 13 pages missing page-specific openGraph |
| 31 | SEO | Not-found page missing description |
| 32 | SEO | Submit canceled/success pages missing metadata |
| 33 | A11y | Form labels not associated via `htmlFor`/`id` |
| 34 | A11y | Low-contrast text (`text-white/40`, `text-white/30`) |
| 35 | A11y | Missing explicit `focus-visible:` styles on most buttons |
| 36 | A11y | Admin `<img>` tags with empty alt text |
| 37 | Hero | External placeholder dependency (placehold.co) |
| 38 | Hero | No skeleton loaders for hero images |
| 39 | Hero | No `onError` handler on Image components |
| 40 | Performance | All public `next/image` use `unoptimized` prop |
| 41 | Mobile | Header height 144px on mobile (28% of viewport) |
| 42 | Mobile | Viewport meta not explicitly declared |
| 43 | Feature | SaveButton has no backend persistence |
| 44 | Feature | Email notifications not implemented |
| 45 | Data | No explicit CORS configuration |
| 46 | Data | Stripe webhook missing signature verification |

---

## Quick-Win Fixes (< 30 minutes each)

1. Add `aria-label="Email address"` to the 5 email inputs
2. Add `aria-label="Close search"` and `aria-label="Close menu"` to Header close buttons
3. Add `title` attribute to the 4 video iframes
4. Add `export const metadata` to homepage `page.tsx`
5. Add `generateMetadata` to events/[slug], areas/[slug], neighborhoods/[slug]
6. Add fallback image to About and Contact hero sections
7. Increase icon button padding from `p-2.5` to `p-3` for touch targets
8. Replace `focus:outline-none` with `focus-visible:ring-2 focus-visible:ring-[#c1121f]`

---

*Generated by Claude Code — Full-Site Forensic Audit*
*Branch: `claude/full-site-forensic-audit-UFupM`*
