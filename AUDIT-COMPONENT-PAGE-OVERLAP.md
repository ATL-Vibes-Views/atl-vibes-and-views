# COMPONENT + PAGE OVERLAP AUDIT

**Repo:** `mellanda-pixel/atl-vibes-and-views`
**Date:** 2026-02-09
**Scope:** All files under `/app` and `/components`

---

## REPO TREE

### `/app`

```
app/
├── favicon.ico
├── globals.css
├── layout.tsx                          ← Root layout (Header + Footer)
├── page.tsx                            ← Homepage (747 lines)
├── areas/
│   ├── page.tsx                        ← /areas landing (515 lines)
│   └── [slug]/page.tsx                 ← /areas/:slug detail (485 lines)
├── events/
│   ├── page.tsx                        ← /events → redirects to /hub/events
│   ├── EventsClient.tsx                ← (670 lines) UNUSED — see note below
│   └── [slug]/page.tsx                 ← /events/:slug detail (792 lines)
├── hub/
│   ├── businesses/
│   │   ├── page.tsx                    ← /hub/businesses listing
│   │   └── BusinessesClient.tsx        ← Client: filters, grid, map
│   ├── dining/
│   │   ├── page.tsx                    ← /hub/dining listing
│   │   └── DiningClient.tsx            ← Client: filters, grid, map
│   ├── eats-and-drinks/
│   │   ├── page.tsx                    ← /hub/eats-and-drinks listing
│   │   └── EatsAndDrinksClient.tsx     ← Client: filters, grid, map
│   ├── events/
│   │   ├── page.tsx                    ← /hub/events listing
│   │   └── EventsClient.tsx            ← Client: filters, grid, map
│   └── things-to-do/
│       ├── page.tsx                    ← /hub/things-to-do listing
│       └── ThingsToDoClient.tsx        ← Client: filters, grid, map
├── neighborhoods/
│   ├── page.tsx                        ← /neighborhoods landing (840 lines)
│   └── [slug]/page.tsx                 ← /neighborhoods/:slug detail (880 lines)
├── places/
│   └── [slug]/
│       ├── page.tsx                    ← /places/:slug detail (1087 lines)
│       └── BusinessDetailClient.tsx    ← Client: gallery, contact, scroller
└── things-to-do/
    └── [slug]/
        ├── page.tsx                    ← /things-to-do/:slug detail (982 lines)
        └── ThingsToDoDetailClient.tsx  ← Client: gallery, scroller
```

### `/components`

```
components/
├── index.ts                ← Barrel export (re-exports everything)
├── Header.tsx              ← Sticky header with nav, drawer, search
├── Footer.tsx              ← 4-col footer with newsletter
├── Sidebar.tsx             ← Widget system (Newsletter, Ad, Neighborhoods, Submit CTAs, Social)
├── SearchBar.tsx           ← Reusable search → pushes ?q= param
├── SaveButton.tsx          ← Heart/favorite toggle (client)
├── NewsletterForm.tsx      ← Email form (compact + full variants)
└── ui/
    ├── index.tsx           ← CategoryPills, StatCounter, PaginationBar, SectionHeader, NeighborhoodCard
    ├── BusinessCard.tsx    ← Business card with image, category, rating, tags
    ├── Button.tsx          ← Variant button (primary/secondary/cta/dark)
    ├── EventCard.tsx       ← Event card (featured/standard/list variants)
    └── StoryCard.tsx       ← Story card (featured/standard/compact variants)
```

---

## A) PAGE INVENTORY TABLE

| Route | Files | Key Imports |
|---|---|---|
| `/` | `app/page.tsx` | Sidebar, NewsletterWidget, AdPlacement, NeighborhoodsWidget, SubmitCTA, SubmitEventCTA, SaveButton, SearchBar, NewsletterForm, `lib/queries` |
| `/areas` | `app/areas/page.tsx` | SearchBar, NewsletterForm, Sidebar, NewsletterWidget, AdPlacement, NeighborhoodsWidget, SubmitCTA, SubmitEventCTA, `lib/queries` |
| `/areas/[slug]` | `app/areas/[slug]/page.tsx` | SearchBar, Sidebar, NewsletterWidget, AdPlacement, NeighborhoodsWidget, SubmitCTA, `lib/queries` |
| `/events` | `app/events/page.tsx` | *(redirect only to /hub/events)* |
| `/events/[slug]` | `app/events/[slug]/page.tsx` | Sidebar, SidebarWidget, WidgetTitle, NewsletterWidget, AdPlacement, SubmitEventCTA, `lib/queries` |
| `/hub/businesses` | `app/hub/businesses/page.tsx` + `BusinessesClient.tsx` | SubmitCTA, SidebarWidget, WidgetTitle, NeighborhoodsWidget, BusinessesClient, `lib/queries`, `lib/supabase` |
| `/hub/dining` | `app/hub/dining/page.tsx` + `DiningClient.tsx` | SubmitCTA, SidebarWidget, WidgetTitle, NeighborhoodsWidget, DiningClient, `lib/queries`, `lib/supabase` |
| `/hub/eats-and-drinks` | `app/hub/eats-and-drinks/page.tsx` + `EatsAndDrinksClient.tsx` | SubmitCTA, SidebarWidget, WidgetTitle, NeighborhoodsWidget, EatsAndDrinksClient, `lib/queries`, `lib/supabase` |
| `/hub/events` | `app/hub/events/page.tsx` + `EventsClient.tsx` | Sidebar widgets, EventsClient (hub), `lib/queries`, `lib/supabase` |
| `/hub/things-to-do` | `app/hub/things-to-do/page.tsx` + `ThingsToDoClient.tsx` | Sidebar widgets, ThingsToDoClient, **BusinessCard** (from `@/components/ui`), `lib/queries`, `lib/supabase` |
| `/neighborhoods` | `app/neighborhoods/page.tsx` | SearchBar, NewsletterForm, Sidebar, SidebarWidget, WidgetTitle, SubmitCTA, SubmitEventCTA, `lib/queries` |
| `/neighborhoods/[slug]` | `app/neighborhoods/[slug]/page.tsx` | SearchBar, Sidebar, SidebarWidget, WidgetTitle, NewsletterWidget, AdPlacement, NeighborhoodsWidget, SubmitCTA, SubmitEventCTA, `lib/queries` |
| `/places/[slug]` | `app/places/[slug]/page.tsx` + `BusinessDetailClient.tsx` | BusinessDetailClient (QuickInfoStrip, PhotoGallery, ContactForm, StarRating, MorePlacesScroller), `lib/supabase` |
| `/things-to-do/[slug]` | `app/things-to-do/[slug]/page.tsx` + `ThingsToDoDetailClient.tsx` | ThingsToDoDetailClient (QuickInfoStrip, PhotoGallery, StarRating, MoreThingsToDoScroller), `lib/supabase` |

**Note:** `app/events/EventsClient.tsx` (670 lines) exists but appears to be a **dead file** — `/events` redirects to `/hub/events`, which uses `app/hub/events/EventsClient.tsx` instead.

---

## B) COMPONENT INVENTORY TABLE

### Shared Components (`/components`)

| Component | Path | Used By Pages | Purpose | Props | Hardcoded Routes |
|---|---|---|---|---|---|
| **Header** | `components/Header.tsx` | `layout.tsx` (all pages) | Sticky nav with drawer, dropdowns, search | None | `/areas`, `/areas/{slug}`, `/neighborhoods`, `/hub/{slug}`, `/beyond-atl/{city}`, `/stories/{slug}`, `/submit`, `/login`, `/city-watch`, `/media` |
| **Footer** | `components/Footer.tsx` | `layout.tsx` (all pages) | 4-column footer with newsletter | None | `/areas/{slug}`, `/hub/businesses`, `/hub/events`, `/hub/eats-and-drinks`, `/hub/things-to-do`, `/hub/atlanta-guide`, `/about`, `/contact`, `/partner`, `/submit`, `/privacy` |
| **Sidebar** | `components/Sidebar.tsx` | Homepage, areas, areas/[slug], neighborhoods, neighborhoods/[slug], events/[slug] | Widget container system | `children` | — |
| **NewsletterWidget** | `components/Sidebar.tsx` | Homepage, areas, areas/[slug], neighborhoods/[slug], events/[slug] | Sidebar newsletter signup | `title`, `description` | — |
| **AdPlacement** | `components/Sidebar.tsx` | Homepage, areas, areas/[slug], neighborhoods/[slug], events/[slug] | Ad slot placeholder | `slot` | `/hub/businesses`, `/hub/events` |
| **NeighborhoodsWidget** | `components/Sidebar.tsx` | Homepage, areas, areas/[slug], neighborhoods/[slug] | Neighborhood links list | `title`, `neighborhoods` | `/neighborhoods/{slug}`, `/neighborhoods` |
| **SubmitCTA** | `components/Sidebar.tsx` | Homepage, areas, areas/[slug], neighborhoods, neighborhoods/[slug], hub/businesses, hub/dining, hub/eats-and-drinks, hub/things-to-do | Business listing CTA | `heading`, `description`, `buttonText`, `href` | `/submit` |
| **SubmitEventCTA** | `components/Sidebar.tsx` | Homepage, areas, neighborhoods, neighborhoods/[slug], events/[slug] | Event submission CTA | None | `/submit` |
| **SocialFollowWidget** | `components/Sidebar.tsx` | Homepage (Sidebar B) | Social media follow links | None | External social URLs |
| **SidebarWidget** | `components/Sidebar.tsx` | hub/* pages, neighborhoods, events/[slug] | Generic widget wrapper | `children`, `className` | — |
| **WidgetTitle** | `components/Sidebar.tsx` | hub/* pages, neighborhoods, events/[slug] | Widget heading | `children`, `className` | — |
| **FeaturedStoriesWidget** | `components/Sidebar.tsx` | **UNUSED** (exported but not imported anywhere) | Sidebar story list | `title`, `stories` | `/blog/{slug}` (WRONG) |
| **GuidePromoWidget** | `components/Sidebar.tsx` | **UNUSED** (exported but not imported anywhere) | Guide promo | `title`, `description`, `href` | `/hub/atlanta-guide` |
| **SearchBar** | `components/SearchBar.tsx` | Homepage, areas, areas/[slug], neighborhoods, neighborhoods/[slug] | Search input with ?q= param | `placeholder`, `className` | — |
| **SaveButton** | `components/SaveButton.tsx` | Homepage | Heart/favorite toggle | `slug` | — |
| **NewsletterForm** | `components/NewsletterForm.tsx` | Homepage, areas, neighborhoods | Email subscription form | `compact` | — |

### UI Components (`/components/ui`)

| Component | Path | Used By Pages | Purpose | Props | Hardcoded Routes |
|---|---|---|---|---|---|
| **BusinessCard** | `components/ui/BusinessCard.tsx` | hub/things-to-do (ThingsToDoClient) | Business listing card | `name`, `slug`, `category`, `neighborhood`, `imageUrl`, `rating`, `tags`, `featured`, `tier` | **`/hub/businesses/${slug}` (WRONG)** |
| **EventCard** | `components/ui/EventCard.tsx` | **UNUSED** (exported but not imported) | Event card (3 variants) | `name`, `slug`, `date`, `category`, `imageUrl`, `featured`, `variant` | **`/hub/events/${slug}` (WRONG)** |
| **StoryCard** | `components/ui/StoryCard.tsx` | **UNUSED** (exported but not imported) | Story card (3 variants) | `title`, `slug`, `excerpt`, `category`, `imageUrl`, `author`, `date`, `variant` | **`/blog/${slug}` (WRONG)** |
| **Button** | `components/ui/Button.tsx` | **UNUSED** (exported but not imported) | Variant button component | `variant`, `size`, `href`, `children` | — |
| **CategoryPills** | `components/ui/index.tsx` | **UNUSED** (exported but not imported) | Filter pills | `categories`, `activeSlug`, `onChange` | — |
| **StatCounter** | `components/ui/index.tsx` | **UNUSED** (exported but not imported) | Stats display | `stats` | — |
| **PaginationBar** | `components/ui/index.tsx` | **UNUSED** (exported but not imported) | Page pagination | `currentPage`, `totalPages`, `onPageChange` | — |
| **SectionHeader** (ui) | `components/ui/index.tsx` | **UNUSED** (exported but not imported) | Section title with action | `eyebrow`, `title`, `description`, `action` | — |
| **NeighborhoodCard** | `components/ui/index.tsx` | **UNUSED** (exported but not imported) | Neighborhood browse card | `name`, `slug`, `description`, `postCount` | `/neighborhoods/${slug}` |

### Local/Inline Components (inside route folders)

| Component | Path | Used By | Purpose |
|---|---|---|---|
| **SectionHeader** (inline) | `app/page.tsx` (~line 700) | Homepage only | Section title with eyebrow + "See All" link |
| **SectionHeader** (inline) | `app/areas/page.tsx` (~line 477) | Areas landing only | Section title with eyebrow + "See All" link |
| **SocialFollowWidget** (inline) | `app/page.tsx` (imported from Sidebar) | Homepage | *(uses shared component)* |
| **BizCard** (inline) | `app/hub/businesses/BusinessesClient.tsx` (~line 98) | hub/businesses only | Business card with image, badges, price, neighborhood link |
| **BizCard** (inline) | `app/hub/dining/DiningClient.tsx` (~line 98) | hub/dining only | Identical to BusinessesClient BizCard |
| **BizCard** (inline) | `app/hub/eats-and-drinks/EatsAndDrinksClient.tsx` (~line 98) | hub/eats-and-drinks only | Identical to BusinessesClient BizCard |
| **EventCardComponent** (inline) | `app/hub/events/EventsClient.tsx` (~line 600) | hub/events only | Event card with date badge, featured badge, venue |
| **QuickInfoStrip** | `app/places/[slug]/BusinessDetailClient.tsx` | places/[slug] only | Hours, price, phone, website strip |
| **PhotoGallery** | `app/places/[slug]/BusinessDetailClient.tsx` | places/[slug] only | Image gallery |
| **ContactForm** | `app/places/[slug]/BusinessDetailClient.tsx` | places/[slug] only | Contact business form |
| **StarRating** | `app/places/[slug]/BusinessDetailClient.tsx` | places/[slug] only | Star rating display |
| **MorePlacesScroller** | `app/places/[slug]/BusinessDetailClient.tsx` | places/[slug] only | Horizontal nearby places scroller |
| **QuickInfoStrip** | `app/things-to-do/[slug]/ThingsToDoDetailClient.tsx` | things-to-do/[slug] only | Hours, price, phone, website strip |
| **PhotoGallery** | `app/things-to-do/[slug]/ThingsToDoDetailClient.tsx` | things-to-do/[slug] only | Image gallery |
| **StarRating** | `app/things-to-do/[slug]/ThingsToDoDetailClient.tsx` | things-to-do/[slug] only | Star rating display |
| **MoreThingsToDoScroller** | `app/things-to-do/[slug]/ThingsToDoDetailClient.tsx` | things-to-do/[slug] only | Horizontal nearby things scroller |

---

## C) OVERLAP GROUPS

### GROUP 1: Hub Client Components (CRITICAL — highest duplication)

**Files:**
- `app/hub/businesses/BusinessesClient.tsx`
- `app/hub/dining/DiningClient.tsx`
- `app/hub/eats-and-drinks/EatsAndDrinksClient.tsx`
- `app/hub/events/EventsClient.tsx`
- `app/hub/things-to-do/ThingsToDoClient.tsx`

**Shared:**
- Identical layout: 9 sections (Hero, Breadcrumbs, Search+Filters, Featured, CTA, Map, Grid+Sidebar, Ad, Newsletter)
- Same filter state management via URL search params (`useRouter` + `useSearchParams`)
- Same search bar, area/neighborhood/category/tier dropdowns
- Same tag pills component
- Same map placeholder section
- Same "Load More" pagination
- Same newsletter CTA at bottom
- Same sidebar composition pattern (children slot)

**Differs:**
- BusinessesClient / DiningClient / EatsAndDrinksClient: Nearly **100% identical** — only differ in label strings ("Businesses" vs "Dining" vs "Eats & Drinks"), some minor heading text
- EventsClient: Has date mode toggle (Upcoming/Current/Past), event type filter, different card layout (date badge)
- ThingsToDoClient: Imports shared `BusinessCard` from `@/components/ui` instead of inline BizCard; different labels

**Recommendation:** **UNIFY** into a single `<HubArchiveClient>` component with a `variant` or `entityType` prop (`"business" | "dining" | "event" | "things-to-do"`). The 3 business-family clients (businesses, dining, eats-and-drinks) are copy-paste identical and MUST be merged immediately. Events and things-to-do can share the same shell with variant-specific sections.

---

### GROUP 2: Hub Server Pages (near-identical data fetching)

**Files:**
- `app/hub/businesses/page.tsx`
- `app/hub/dining/page.tsx`
- `app/hub/eats-and-drinks/page.tsx`
- `app/hub/things-to-do/page.tsx`

**Shared:**
- Identical hero section (desktop 2-col black bg + mobile responsive)
- Identical breadcrumb section
- Same data fetching pattern: areas, neighborhoods, categories, tags, amenities, identities, featured, grid, map, images
- Same sidebar composition (SubmitCTA, Top Neighborhoods, Browse Events cross-link, Ad slot)
- Same JSON-LD breadcrumb schema

**Differs:**
- Hero title/description strings
- dining/page.tsx and eats-and-drinks/page.tsx add `DINING_CATEGORY_SLUGS` hard filter
- things-to-do/page.tsx uses `applies_to: ["things_to_do"]` category filter
- Breadcrumb label text

**Recommendation:** **UNIFY** into a shared `getHubPageData()` utility + a `<HubHero>` and `<HubBreadcrumbs>` component. The 4 pages can share ~90% of their server code with a config object specifying entity type, category filter, and labels.

---

### GROUP 3: Inline BizCard Components

**Files:**
- `app/hub/businesses/BusinessesClient.tsx` → `BizCard` (~line 98)
- `app/hub/dining/DiningClient.tsx` → `BizCard` (~line 98)
- `app/hub/eats-and-drinks/EatsAndDrinksClient.tsx` → `BizCard` (~line 98)
- `components/ui/BusinessCard.tsx` → `BusinessCard` (shared component)

**Shared:**
- All render: image, category pill, business name, address, neighborhood link
- All have hover scale effect on image
- All link to a business detail page

**Differs:**
- Inline `BizCard` links to `/places/${slug}` (CORRECT)
- Shared `BusinessCard` links to `/hub/businesses/${slug}` (WRONG — route doesn't exist)
- Inline `BizCard` uses `next/image` with `fill` + more Tailwind styling
- Shared `BusinessCard` uses raw `<img>` tag, has rating/stars/tags support, `tier` visibility logic

**Recommendation:** **UNIFY** into a single `BusinessCard` in `/components/ui/`. Fix the route to `/places/${slug}`. Merge the premium badge, price badge, rating, and tags features from both versions into one component with optional props.

---

### GROUP 4: Event Card Components

**Files:**
- `app/hub/events/EventsClient.tsx` → `EventCardComponent` (~line 600, inline)
- `app/page.tsx` → inline event rendering (~line 554)
- `app/areas/[slug]/page.tsx` → inline event rendering
- `app/neighborhoods/[slug]/page.tsx` → inline event rendering
- `components/ui/EventCard.tsx` → shared `EventCard` (3 variants)

**Shared:**
- All render: image with hover scale, date badge (month + day), category pill, title, venue/location
- 3:2 aspect ratio image
- Featured badge

**Differs:**
- Inline versions link to `/events/${slug}` (CORRECT)
- Shared `EventCard` links to `/hub/events/${slug}` (WRONG — route doesn't exist)
- Shared `EventCard` has 3 variants (featured/standard/list) — more flexible
- Inline versions have slightly different badge positions (bottom-right vs top-left)

**Recommendation:** **UNIFY** into the shared `EventCard`. Fix the route to `/events/${slug}`. Use `variant` prop for layout differences. Replace all inline event card rendering.

---

### GROUP 5: Story/Blog Card Rendering

**Files:**
- `app/page.tsx` → inline Editor's Picks cards (~line 229)
- `app/areas/page.tsx` → inline masonry feed cards
- `app/areas/[slug]/page.tsx` → inline story cards
- `app/neighborhoods/page.tsx` → inline story cards
- `app/neighborhoods/[slug]/page.tsx` → inline story cards
- `components/ui/StoryCard.tsx` → shared `StoryCard` (3 variants)

**Shared:**
- All render: image, category pill, title, date, hover scale effect
- Link to `/stories/${slug}`

**Differs:**
- Shared `StoryCard` links to `/blog/${slug}` (WRONG — should be `/stories/${slug}`)
- Shared `StoryCard` has `featured`, `standard`, `compact` variants — more flexible
- Inline versions use slightly different sizing and gold pill styling

**Recommendation:** **UNIFY** into the shared `StoryCard`. Fix the route to `/stories/${slug}`. Replace all 5+ inline story card renderings.

---

### GROUP 6: SectionHeader Components

**Files:**
- `app/page.tsx` → inline `SectionHeader` (~line 700)
- `app/areas/page.tsx` → inline `SectionHeader` (~line 477)
- `components/ui/index.tsx` → shared `SectionHeader`
- `app/hub/businesses/BusinessesClient.tsx` → inline section headers (multiple)
- `app/hub/dining/DiningClient.tsx` → inline section headers
- `app/hub/eats-and-drinks/EatsAndDrinksClient.tsx` → inline section headers
- `app/hub/events/EventsClient.tsx` → inline section headers
- `app/hub/things-to-do/ThingsToDoClient.tsx` → inline section headers

**Shared:**
- All render: eyebrow text (uppercase, small, colored) + large display title + optional "See All" link
- Border-bottom separator

**Differs:**
- Homepage/areas inline versions: eyebrow color is `#c1121f`, title is `text-3xl md:text-4xl`, uses ArrowRight icon
- Shared version: uses `eyebrow eyebrow-red` class, `text-section-sm md:text-section`, action as text with `→`
- Hub clients: inline with different structure (span for count on right side)

**Recommendation:** **UNIFY** into the shared `SectionHeader` from `components/ui/index.tsx`. Add optional `count` prop. The shared version is never imported — start using it.

---

### GROUP 7: Hero Blocks

**Files:**
- `app/page.tsx` → Full-bleed image hero with gradient overlay
- `app/areas/page.tsx` → Full-bleed image/video hero with gradient overlay
- `app/neighborhoods/page.tsx` → Full-bleed hero
- `app/hub/businesses/page.tsx` → Split 2-col hero (desktop) / stacked (mobile)
- `app/hub/dining/page.tsx` → Split 2-col hero (identical to businesses)
- `app/hub/eats-and-drinks/page.tsx` → Split 2-col hero (identical to businesses)
- `app/hub/events/page.tsx` → Split 2-col hero (identical to businesses)
- `app/hub/things-to-do/page.tsx` → Split 2-col hero (identical to businesses)

**Shared within hub pages:**
- 4 hub pages have pixel-identical hero code: 2-col desktop with image left + text right, mobile stacked
- Same Tailwind classes, same structure, only strings differ

**Recommendation:** Create `<HubHero eyebrow="The Hub" title="..." description="..." imageSrc="..." />`. For the editorial pages (homepage, areas, neighborhoods), create `<FullBleedHero>` with gradient overlay support.

---

### GROUP 8: Newsletter Sections

**Files:**
- `app/page.tsx` → Bottom CTA section (~line 625)
- `app/areas/page.tsx` → Bottom CTA section (~line 442)
- `app/hub/businesses/BusinessesClient.tsx` → Bottom newsletter section
- `app/hub/dining/DiningClient.tsx` → Bottom newsletter section
- `app/hub/eats-and-drinks/EatsAndDrinksClient.tsx` → Bottom newsletter section
- `app/hub/events/EventsClient.tsx` → Bottom newsletter section
- `app/hub/things-to-do/ThingsToDoClient.tsx` → Bottom newsletter section
- `components/Sidebar.tsx` → `NewsletterWidget` (sidebar variant)
- `components/NewsletterForm.tsx` → Form only (shared)
- `components/Footer.tsx` → Inline newsletter form

**Shared:**
- All render: heading + description + email input + subscribe button
- Similar styling (centered, gold/black theme)

**Differs:**
- Homepage/areas: uses `NewsletterForm` component, beige bg `#f8f5f0`
- Hub clients: inline form (not using `NewsletterForm`), black bg
- Footer: inline form, dark bg
- Sidebar: compact variant via `NewsletterForm compact`

**Recommendation:** **UNIFY** into `<NewsletterSection variant="light" | "dark" />` that wraps `NewsletterForm`. Replace all 7+ inline newsletter sections.

---

### GROUP 9: Breadcrumb Blocks

**Files:**
- `app/hub/businesses/page.tsx` → inline breadcrumb nav
- `app/hub/dining/page.tsx` → inline breadcrumb nav
- `app/hub/eats-and-drinks/page.tsx` → inline breadcrumb nav
- `app/hub/events/page.tsx` → inline breadcrumb nav (likely)
- `app/hub/things-to-do/page.tsx` → inline breadcrumb nav (likely)
- `app/events/[slug]/page.tsx` → inline breadcrumb nav
- `app/neighborhoods/[slug]/page.tsx` → inline breadcrumb nav
- `app/areas/[slug]/page.tsx` → inline breadcrumb nav

**Shared:**
- All use: Home > (parent) > Current with `ChevronRight` separator
- Same Tailwind: `text-xs text-gray-mid` links, `text-black font-medium` current
- Same JSON-LD `BreadcrumbList` schema

**Recommendation:** **UNIFY** into `<Breadcrumbs items={[{label, href}, ...]} />` with automatic JSON-LD generation.

---

### GROUP 10: Ad Placement Blocks

**Files:**
- `app/page.tsx` → Horizontal ad (~line 522)
- `app/areas/page.tsx` → Horizontal ad (~line 334)
- `app/hub/businesses/BusinessesClient.tsx` → Horizontal ad + sidebar ad
- `app/hub/dining/DiningClient.tsx` → Horizontal ad + sidebar ad
- `app/hub/eats-and-drinks/EatsAndDrinksClient.tsx` → Horizontal ad + sidebar ad
- `components/Sidebar.tsx` → `AdPlacement` (sidebar variant, shared)

**Shared:**
- All render: dashed border, centered "Advertise Here" text, hover state

**Differs:**
- Sidebar `AdPlacement`: 300x250 fixed size, links to `/hub/businesses` or `/hub/events`
- Horizontal ads: full-width, different height, some link to `/hub/businesses`

**Recommendation:** Extend existing `AdPlacement` component with a `variant="horizontal" | "sidebar"` prop.

---

### GROUP 11: Detail Page Client Components

**Files:**
- `app/places/[slug]/BusinessDetailClient.tsx` (434 lines)
- `app/things-to-do/[slug]/ThingsToDoDetailClient.tsx` (343 lines)

**Shared:**
- Both export: `QuickInfoStrip`, `PhotoGallery`, `StarRating`
- Both have a "more items" horizontal scroller (`MorePlacesScroller` / `MoreThingsToDoScroller`)
- `QuickInfoStrip`: identical purpose (hours, price, phone, website)
- `PhotoGallery`: identical modal gallery with thumbnails
- `StarRating`: identical star rating display

**Differs:**
- `BusinessDetailClient` has `ContactForm` (missing from things-to-do)
- Scroller links: `/places/${slug}` vs `/things-to-do/${slug}`
- Minor label differences

**Recommendation:** Extract `QuickInfoStrip`, `PhotoGallery`, and `StarRating` into shared `/components/ui/` modules. Keep scrollers separate (different entity types) OR parameterize with `basePath` prop.

---

### GROUP 12: TikTok Icon (triple-defined)

**Files:**
- `components/Header.tsx` → `TikTokIcon`
- `components/Footer.tsx` → `TikTokIcon`
- `components/Sidebar.tsx` → `TikTokIcon`

**Shared:** 100% identical SVG component.

**Recommendation:** Extract to `components/ui/icons/TikTokIcon.tsx` and import in all 3 files.

---

## D) ROUTING MISMATCH LIST

| File | Line(s) | Current Route | Problem | Correct Target |
|---|---|---|---|---|
| `components/ui/BusinessCard.tsx` | 46 | `/hub/businesses/${slug}` | Route `/hub/businesses/[slug]` does **NOT exist**. Business detail is at `/places/[slug]`. | `/places/${slug}` |
| `components/ui/EventCard.tsx` | 50, 103 | `/hub/events/${slug}` | Route `/hub/events/[slug]` does **NOT exist**. Event detail is at `/events/[slug]`. | `/events/${slug}` |
| `components/ui/StoryCard.tsx` | 44, 71 | `/blog/${slug}` | Route `/blog` does **NOT exist**. Stories use `/stories/[slug]` across the site. | `/stories/${slug}` |
| `components/Sidebar.tsx` | 177 | `/blog/${story.slug}` | Route `/blog` does **NOT exist**. (Inside `FeaturedStoriesWidget`.) | `/stories/${story.slug}` |

**Note:** These 4 mismatches are in shared UI components. Any page that starts using `BusinessCard`, `EventCard`, or `StoryCard` will have broken links. Currently only `BusinessCard` is imported (by `ThingsToDoClient`), meaning **`/hub/things-to-do` has broken business detail links right now**.

### Missing Route Pages (referenced but don't exist as listing pages):

| Referenced Route | Where Referenced | Issue |
|---|---|---|
| `/places` (listing) | No references found, but `/places/[slug]` exists | No business listing page at `/places` — businesses are listed at `/hub/businesses` |
| `/things-to-do` (listing) | No references found, but `/things-to-do/[slug]` exists | No things-to-do listing at `/things-to-do` — listed at `/hub/things-to-do` |
| `/stories` | Homepage "See All" links | Page doesn't exist — may need redirect or page |
| `/blog` | `StoryCard.tsx`, `Sidebar.tsx` | Page doesn't exist — components reference wrong base path |
| `/media` | Homepage, areas page | Page doesn't exist (referenced in nav + content) |
| `/city-watch` | Header nav, areas page | Page doesn't exist (referenced in nav) |
| `/hub` | Header nav | No hub index page exists |
| `/submit` | Many pages | Page doesn't exist (CTAs reference it) |
| `/hub/atlanta-guide` | Header, Footer | Page doesn't exist |
| `/partner` | Hub businesses CTA, Footer | Page doesn't exist |

---

## E) TOP 10 "STANDARDIZE NEXT" COMPONENTS

| Priority | Component | Reason |
|---|---|---|
| **1** | **HubArchiveClient** (merge 5 hub clients) | BusinessesClient, DiningClient, and EatsAndDrinksClient are **copy-paste identical** (~600 lines each = ~1800 wasted lines). EventsClient and ThingsToDoClient share ~80% of the code. Merge into one parameterized component. |
| **2** | **BusinessCard** (fix + adopt) | Fix route from `/hub/businesses/${slug}` → `/places/${slug}`. Replace all 3 inline `BizCard` components in hub clients. Currently has a live broken link in `/hub/things-to-do`. |
| **3** | **EventCard** (fix + adopt) | Fix route from `/hub/events/${slug}` → `/events/${slug}`. Replace inline `EventCardComponent` in hub events client AND inline event rendering on homepage, areas, and neighborhood pages. |
| **4** | **StoryCard** (fix + adopt) | Fix route from `/blog/${slug}` → `/stories/${slug}`. Replace inline story card rendering on homepage, areas, and neighborhoods pages (~5 locations). |
| **5** | **Breadcrumbs** (new shared) | 8+ pages render identical breadcrumb nav + JSON-LD inline. Extract to `<Breadcrumbs items={...} />`. |
| **6** | **SectionHeader** (adopt existing) | Shared `SectionHeader` in `components/ui/index.tsx` is **never imported**. 8+ pages define it inline. Add optional `count` prop, start using it everywhere. |
| **7** | **NewsletterSection** (new shared) | 7+ pages have inline newsletter sections. Wrap `NewsletterForm` in a `<NewsletterSection>` with light/dark variants. |
| **8** | **HubHero** (new shared) | 5 hub pages have identical 2-col hero blocks. Extract to `<HubHero>` with title/description/image props. |
| **9** | **QuickInfoStrip + PhotoGallery + StarRating** (extract from detail clients) | Duplicated between `BusinessDetailClient.tsx` and `ThingsToDoDetailClient.tsx`. Extract into `/components/ui/`. |
| **10** | **TikTokIcon** (extract) | Defined 3 times identically in Header, Footer, Sidebar. Extract to shared icon module. |

---

## APPENDIX: UNUSED EXPORTS

The following components are exported from `components/index.ts` but **never imported by any page**:

| Component | File | Notes |
|---|---|---|
| `EventCard` | `components/ui/EventCard.tsx` | Has wrong routes. Pages use inline event cards instead. |
| `StoryCard` | `components/ui/StoryCard.tsx` | Has wrong routes. Pages use inline story cards instead. |
| `Button` | `components/ui/Button.tsx` | Well-designed variant system but unused. Pages use inline `<Link>` / `<button>`. |
| `CategoryPills` | `components/ui/index.tsx` | Hub clients implement their own tag pills / filter pills. |
| `StatCounter` | `components/ui/index.tsx` | No page uses it. |
| `PaginationBar` | `components/ui/index.tsx` | Hub clients use "Load More" button instead. |
| `SectionHeader` (ui) | `components/ui/index.tsx` | Pages define their own inline SectionHeader. |
| `NeighborhoodCard` | `components/ui/index.tsx` | Neighborhood pages render cards inline. |
| `FeaturedStoriesWidget` | `components/Sidebar.tsx` | Has wrong route (`/blog/`). Never imported. |
| `GuidePromoWidget` | `components/Sidebar.tsx` | Never imported. |

**Dead file:** `app/events/EventsClient.tsx` (670 lines) — `/events` redirects to `/hub/events`, which uses its own `EventsClient.tsx`.

---

*End of audit.*
