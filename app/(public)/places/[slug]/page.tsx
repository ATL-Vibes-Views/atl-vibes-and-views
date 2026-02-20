import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ChevronRight,
  Star,
  BadgeCheck,
  ArrowRight,
  Tag,
  Shield,
} from "lucide-react";
import {
  getBusinessDetailBySlug,
  getBusinessImages,
  getBusinessHours,
  getBusinessAmenityLinks,
  getBusinessTagLinks,
  getBusinessIdentityLinks,
  getApprovedReviews,
  getRelatedBusinesses,
  getBusinessPrimaryImages,
  getLinkedBlogPosts,
} from "@/lib/queries";
import {

  QuickInfoStrip,
  PhotoGallery,
  ContactForm,
  StarRating,
  MorePlacesScroller,
} from "./BusinessDetailClient";

export const dynamic = "force-dynamic";

/* =============================================================
   HELPERS
   ============================================================= */
const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function formatTime(t: string) {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function platformLabel(p: string) {
  const m: Record<string, string> = {
    instagram: "IG",
    facebook: "FB",
    tiktok: "TT",
    x_twitter: "𝕏",
  };
  return m[p] || p;
}

function platformUrl(platform: string, handle: string) {
  if (handle.startsWith("http")) return handle;
  const bases: Record<string, string> = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/@",
    x_twitter: "https://x.com/",
  };
  return (bases[platform] || "") + handle;
}

/* =============================================================
   METADATA
   ============================================================= */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const biz = await getBusinessDetailBySlug(slug);
  if (!biz) return { title: "Business Not Found" };
  const neighborhood = biz.neighborhoods;
  const area = neighborhood?.areas;
  return {
    title: `${biz.business_name} — ${neighborhood?.name || "Atlanta"} | ATL Vibes & Views`,
    description:
      biz.description?.substring(0, 160) ||
      `Discover ${biz.business_name} in ${neighborhood?.name || "Atlanta"}.`,
    openGraph: {
      title: biz.business_name,
      description:
        biz.description?.substring(0, 160) ||
        `Discover ${biz.business_name} in ${neighborhood?.name || "Atlanta"}.`,
      url: `https://atlvibesandviews.com/places/${biz.slug}`,
      type: "website",
    },
  };
}

/* =============================================================
   PAGE COMPONENT
   ============================================================= */
export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const biz = await getBusinessDetailBySlug(slug);
  if (!biz) notFound();

  const neighborhood = biz.neighborhoods;
  const area = neighborhood?.areas;
  const category = biz.categories;

  /* ── Parallel data fetches ── */
  const [images, hours, amenities, tags, identities, reviews] =
    await Promise.all([
      getBusinessImages(biz.id),
      getBusinessHours(biz.id),
      getBusinessAmenityLinks(biz.id),
      getBusinessTagLinks(biz.id),
      getBusinessIdentityLinks(biz.id),
      getApprovedReviews(biz.id),
    ]);

  /* ── Sort hours ── */
  const sortedHours = [...hours].sort(
    (a: any, b: any) =>
      DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  );

  /* ── Reviews stats ── */
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      : null;

  /* ── Hero image fallback ── */
  const primaryImage = images.find((img: any) => img.is_primary);
  const heroImage =
    primaryImage?.image_url ||
    images[0]?.image_url ||
    biz.logo ||
    "/images/default-hero.png";

  /* ── In the News: blog posts linked via post_businesses ── */
  const inTheNewsPosts = await getLinkedBlogPosts(biz.id);

  /* ── More places ── */
  const morePlaces = await getRelatedBusinesses({
    currentId: biz.id,
    neighborhoodId: biz.neighborhood_id,
    categoryId: biz.category_id,
  });
  const morePlacesImageMap = await getBusinessPrimaryImages(
    morePlaces.map((p: any) => p.id)
  );

  /* Build serializable array for client component */
  const morePlacesData = morePlaces.map((place: any) => ({
    id: place.id,
    slug: place.slug,
    business_name: place.business_name,
    logo: place.logo,
    neighborhoods: place.neighborhoods,
    categories: place.categories,
    imageUrl:
      morePlacesImageMap[place.id] ||
      place.logo ||
      "/images/default-hero.png",
  }));

  /* ── Social links ── */
  const socials = (
    ["instagram", "facebook", "tiktok", "x_twitter"] as const
  )
    .filter((p) => biz[p])
    .map((p) => ({ platform: p, handle: biz[p]! }));

  /* ── Has any details content? ── */
  const hasHours = sortedHours.length > 0;
  const hasAmenities = amenities.length > 0;
  const hasTags = tags.length > 0;
  const hasIdentities = identities.length > 0;
  const hasSocials = socials.length > 0;

  /* ── JSON-LD ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: biz.business_name,
    image: heroImage,
    url: `https://atlvibesandviews.com/places/${biz.slug}`,
    ...(biz.phone && { telephone: biz.phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: [biz.street_address, biz.street_address_2]
        .filter(Boolean)
        .join(", "),
      addressLocality: biz.cities?.name,
      addressRegion: biz.state,
      postalCode: biz.zip_code,
      addressCountry: "US",
    },
    ...(biz.latitude &&
      biz.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: biz.latitude,
          longitude: biz.longitude,
        },
      }),
    ...(avgRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
    ...(biz.price_range && { priceRange: biz.price_range }),
    ...(neighborhood && {
      containedInPlace: {
        "@type": "Neighborhood",
        name: neighborhood.name,
        containedInPlace: {
          "@type": "City",
          name: "Atlanta",
          containedInPlace: { "@type": "State", name: "Georgia" },
        },
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://atlvibesandviews.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Atlanta",
        item: "https://atlvibesandviews.com",
      },
      ...(neighborhood
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: neighborhood.name,
              item: `https://atlvibesandviews.com/neighborhoods/${neighborhood.slug}`,
            },
          ]
        : []),
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: neighborhood ? 4 : 3,
              name: category.name,
              item: `https://atlvibesandviews.com/hub/businesses?category=${category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position:
          2 + (neighborhood ? 1 : 0) + (category ? 1 : 0) + 1,
        name: biz.business_name,
      },
    ],
  };

  /* =============================================================
     SHARED DETAIL BLOCK (used in sidebar on desktop, main on mobile)
     ============================================================= */
  function DetailsBlock({ id }: { id?: string }) {
    return (
      <div id={id} className="space-y-5">
        {/* Address */}
        <div className="flex gap-3">
          <MapPin size={18} className="text-[#fee198] shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p>{biz.street_address}</p>
            {biz.street_address_2 && <p>{biz.street_address_2}</p>}
            <p>
              {biz.cities?.name}, {biz.state} {biz.zip_code}
            </p>
          </div>
        </div>

        {/* Phone */}
        {biz.phone && (
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-[#fee198] shrink-0" />
            <a
              href={`tel:${biz.phone}`}
              className="text-sm hover:text-[#c1121f] transition-colors"
            >
              {biz.phone}
            </a>
          </div>
        )}

        {/* Email */}
        {biz.email && (
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[#fee198] shrink-0" />
            <a
              href={`mailto:${biz.email}`}
              className="text-sm hover:text-[#c1121f] transition-colors break-all"
            >
              {biz.email}
            </a>
          </div>
        )}

        {/* Website */}
        {biz.website && (
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-[#fee198] shrink-0" />
            <a
              href={
                biz.website.startsWith("http")
                  ? biz.website
                  : `https://${biz.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-[#c1121f] transition-colors break-all"
            >
              {biz.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}

        {/* Order Online */}
        {biz.order_online_url && (
          <a
            href={biz.order_online_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c1121f] hover:underline"
          >
            Order Online <ArrowRight size={14} />
          </a>
        )}

        {/* Social links */}
        {hasSocials && (
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.platform}
                href={platformUrl(s.platform, s.handle)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] text-[11px] font-bold text-[#333] hover:bg-[#1a1a1a] hover:text-white transition-colors"
              >
                {platformLabel(s.platform)}
              </a>
            ))}
          </div>
        )}

        {/* Divider + Hours */}
        <hr className="border-gray-200" />
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#333] mb-2">
            <Clock size={14} className="text-[#fee198]" /> Hours
          </h4>
          {hasHours ? (
            <div className="space-y-0.5">
              {sortedHours.map((h: any) => (
                <div
                  key={h.day_of_week}
                  className="flex justify-between text-sm"
                >
                  <span className="font-medium text-[#333]">
                    {DAY_SHORT[h.day_of_week] || h.day_of_week}
                  </span>
                  <span className="text-gray-500">
                    {h.is_closed
                      ? "Closed"
                      : `${formatTime(h.open_time)} – ${formatTime(h.close_time)}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Hours not available</p>
          )}
        </div>

        {/* Amenities */}
        {hasAmenities && (
          <>
            <hr className="border-gray-200" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#333] mb-2">
                Amenities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((a: any) => (
                  <span
                    key={a.id}
                    className="inline-block bg-[#f8f5f0] text-[#1a1a1a] text-xs font-medium px-3 py-1.5 hover:bg-[#fee198] transition-colors rounded-full"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tags */}
        {hasTags && (
          <>
            <hr className="border-gray-200" />
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#333] mb-2">
                <Tag size={14} className="text-[#fee198]" /> Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t: any) => (
                  <span
                    key={t.id}
                    className="inline-block bg-[#f8f5f0] text-[#1a1a1a] text-xs font-medium px-3 py-1.5 hover:bg-[#fee198] transition-colors rounded-full"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Identity badges */}
        {hasIdentities && (
          <>
            <hr className="border-gray-200" />
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#333] mb-2">
                <Shield size={14} className="text-[#fee198]" /> Identity
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {identities.map((id: any) => (
                  <span
                    key={id.id}
                    className="inline-flex items-center gap-1 bg-[#f8f5f0] text-[#1a1a1a] text-xs font-medium px-3 py-1.5 hover:bg-[#fee198] transition-colors rounded-full"
                  >
                    <BadgeCheck size={12} /> {id.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  /* =============================================================
     SIDEBAR MODULES (Map, Price, Claim, Contact)
     ============================================================= */
  function SidebarModules() {
    return (
      <>
        {/* Map placeholder */}
        <div className="overflow-hidden border border-gray-200">
          <div className="bg-[#f5f5f5] flex items-center justify-center h-[200px]">
            <div className="text-center">
              <MapPin size={24} className="text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-gray-400 uppercase tracking-widest">
                Map Coming Soon
              </span>
            </div>
          </div>
          <div className="px-4 py-3 bg-white text-sm text-[#333]">
            {biz.street_address}, {biz.cities?.name}, {biz.state} {biz.zip_code}
          </div>
        </div>

        {/* Price Range */}
        {biz.price_range && (
          <div className="border border-gray-200 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#333] mb-2">
              Price Range
            </h4>
            <span className="text-2xl font-display font-bold tracking-wide text-black">
              {biz.price_range}
            </span>
          </div>
        )}

        {/* Claim Listing (Free tier only) */}
        {biz.tier === "Free" && (
          <div className="border-2 border-dashed border-[#e6c46d]/40 bg-[#fee198]/10 p-5 text-center">
            <h4 className="font-display text-lg font-semibold text-black mb-1">
              Is this your business?
            </h4>
            <p className="text-sm text-gray-500 mb-3">
              Claim your listing to update info, add photos, and unlock
              premium features.
            </p>
            <Link
              href="/submit"
              className="inline-block bg-[#c1121f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
            >
              Claim Your Listing
            </Link>
          </div>
        )}

        {/* Contact form */}
        <div className="border border-gray-200 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#333] mb-3">
            Contact This Business
          </h4>
          <ContactForm businessName={biz.business_name} />
        </div>
      </>
    );
  }

  /* =============================================================
     RENDER
     ============================================================= */
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] overflow-hidden">
        <Image
          src={heroImage}
          alt={biz.business_name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end max-w-[1280px] mx-auto px-6 pb-8">
          {/* Category pill + Featured badge + Claim badge */}
          <div className="flex items-center gap-2 mb-3">
            {category && (
              <Link
                href={`/hub/businesses?category=${category.slug}`}
                className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white/30 transition-colors rounded-full"
              >
                {category.name}
              </Link>
            )}
            {biz.is_featured && (
              <span className="inline-flex items-center gap-1 bg-[#fee198] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#1a1a1a] rounded-full">
                <Star size={12} className="fill-current" /> Featured
              </span>
            )}
          </div>

          {/* Business name */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-1">
            {biz.business_name}
          </h1>

          {/* Tagline */}
          {biz.tagline && (
            <p className="text-base sm:text-lg text-white/80 mb-4 max-w-2xl">
              {biz.tagline}
            </p>
          )}

          {/* Quick Info Strip */}
          <QuickInfoStrip
            avgRating={avgRating}
            reviewCount={reviews.length}
            tier={biz.tier}
          />
        </div>
      </section>

      {/* ============================================================
          BUSINESS LOGO (overlaps hero bottom)
          ============================================================ */}
      <div className="relative max-w-[1280px] mx-auto px-6">
        <div className="-mt-12 mb-4 relative z-10">
          <div className="w-[96px] h-[96px] bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
            {biz.logo ? (
              <Image
                src={biz.logo}
                alt={`${biz.business_name} logo`}
                width={96}
                height={96}
                className="object-contain"
                unoptimized
              />
            ) : (
              <span className="text-3xl font-display font-bold text-[#1a1a1a]">
                {biz.business_name.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN LAYOUT
          ============================================================ */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* ── BREADCRUMBS ── */}
        <nav className="flex items-center flex-wrap gap-1 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#c1121f] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link href="/" className="hover:text-[#c1121f] transition-colors">
            Atlanta
          </Link>
          {neighborhood && (
            <>
              <ChevronRight size={14} className="shrink-0" />
              <Link
                href={`/neighborhoods/${neighborhood.slug}`}
                className="hover:text-[#c1121f] transition-colors"
              >
                {neighborhood.name}
              </Link>
            </>
          )}
          {category && (
            <>
              <ChevronRight size={14} className="shrink-0" />
              <Link
                href={`/hub/businesses?category=${category.slug}`}
                className="hover:text-[#c1121f] transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-black font-medium">{biz.business_name}</span>
        </nav>

        {/* ── TWO-COLUMN GRID ── */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-10">
          {/* ========== MAIN COLUMN ========== */}
          <div className="min-w-0">
            {/* ── Description ── */}
            <section className="mb-10">
              <h2 className="font-display text-2xl font-bold text-black mb-4">
                About {biz.business_name}
              </h2>
              <div className="prose prose-sm max-w-none text-[#333] leading-relaxed">
                {biz.description ? (
                  biz.description.split("\n").map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))
                ) : (
                  <p className="text-gray-400 italic">
                    No description available.
                  </p>
                )}
              </div>

              {/* Special offers */}
              {biz.special_offers && (
                <div className="mt-4 bg-[#fee198]/20 border border-[#e6c46d]/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#e6c46d] mb-1">
                    Special Offer
                  </p>
                  <p className="text-sm text-[#333]">
                    {biz.special_offers}
                  </p>
                </div>
              )}
            </section>

            {/* ── MOBILE ONLY: Location + Amenities ── */}
            <section className="lg:hidden mb-10 border border-gray-200 p-5">
              <DetailsBlock />
            </section>

            {/* ── MOBILE ONLY: Newsletter after details ── */}
            <div className="lg:hidden mb-10">
              <div className="border border-gray-100 p-5 bg-[#fee198]">
                <h4 className="font-display text-card-sm font-semibold mb-2">Stay in the Loop</h4>
                <p className="text-sm text-gray-dark mb-3">
                  Get the latest on Atlanta businesses, events, and neighborhood stories.
                </p>
                <form action="#" className="flex">
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    required
                    className="flex-1 px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-[#e6c46d]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-eyebrow hover:bg-[#e6c46d] hover:text-black transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* ── Photos ── */}
            {images.length > 0 && (
              <section className="mb-10">
                <h2 className="font-display text-2xl font-bold text-black mb-4">
                  Photos
                </h2>
                <PhotoGallery images={images} />
              </section>
            )}

            {/* ── Video ── */}
            {biz.video_url && (
              <section className="mb-10 bg-[#f8f5f0] p-6">
                <h2 className="font-display text-2xl font-bold text-black mb-4">
                  Video
                </h2>
                <div className="relative w-full aspect-video overflow-hidden bg-black">
                  {biz.video_url.includes("youtube") ||
                  biz.video_url.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${
                        biz.video_url.includes("youtu.be")
                          ? biz.video_url.split("/").pop()
                          : new URL(biz.video_url).searchParams.get("v")
                      }`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${biz.business_name} video`}
                    />
                  ) : biz.video_url.includes("vimeo") ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${biz.video_url.split("/").pop()}`}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`${biz.business_name} video`}
                    />
                  ) : (
                    <video
                      src={biz.video_url}
                      controls
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}
                </div>
              </section>
            )}

            {/* ── MOBILE ONLY: Sidebar modules ── */}
            <div className="lg:hidden space-y-5 mb-10">
              <SidebarModules />
            </div>

            {/* ── Reviews ── */}
            <section id="reviews-section" className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="font-display text-2xl font-bold text-black">
                  Reviews
                </h2>
                {reviews.length > 0 && (
                  <span className="text-sm text-gray-400">
                    ({reviews.length})
                  </span>
                )}
              </div>

              {/* Rating summary */}
              {avgRating !== null && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-[#f5f5f5]">
                  <span className="text-3xl font-display font-bold text-black">
                    {avgRating.toFixed(1)}
                  </span>
                  <div>
                    <StarRating rating={avgRating} size={18} />
                    <p className="text-xs text-gray-400 mt-0.5">
                      Based on {reviews.length} review
                      {reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Review cards */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r: any) => (
                    <div
                      key={r.id}
                      className="border border-gray-200 p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <StarRating rating={r.rating} size={14} />
                        <span className="text-xs text-gray-400">
                          {formatDate(r.published_at || r.created_at)}
                        </span>
                      </div>
                      {r.title && (
                        <h4 className="font-semibold text-sm text-black mb-1">
                          {r.title}
                        </h4>
                      )}
                      {r.body && (
                        <p className="text-sm text-[#333] leading-relaxed">
                          {r.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 p-8 text-center">
                  <p className="text-gray-400">
                    No reviews yet. Be the first to share your experience.
                  </p>
                </div>
              )}
            </section>

            {/* ── MOBILE ONLY: SubmitCTA before In the News ── */}
            <div className="lg:hidden mb-10">
              <div className="border border-gray-100 p-5 bg-[#1a1a1a] text-white">
                <h4 className="font-display text-card-sm font-semibold text-white mb-2">Claim This Listing</h4>
                <p className="text-sm text-white/70 mb-4">
                  Is this your business? Claim it to update your info and reach more customers.
                </p>
                <Link
                  href="/submit"
                  className="block w-full text-center bg-[#fee198] text-[#1a1a1a] font-semibold text-sm uppercase tracking-wide px-6 py-3 hover:bg-[#f5d87a] transition-colors"
                >
                  Claim Listing
                </Link>
              </div>
            </div>

            {/* ── In the News ── */}
            {inTheNewsPosts.length > 0 && (
              <section className="mb-10">
                <div className="mb-6">
                  <span className="text-[#c1121f] text-[11px] font-semibold uppercase tracking-eyebrow">
                    In the News
                  </span>
                  <h2 className="font-display text-2xl font-bold text-black mt-1">
                    Stories Featuring {biz.business_name}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {inTheNewsPosts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/stories/${post.slug}`}
                      className="group block border border-gray-200 hover:border-[#e6c46d] transition-colors overflow-hidden"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={post.featured_image_url || "/images/default-hero.png"}
                          alt={post.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        {post.categories?.name && (
                          <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-[#c1121f]">
                            {post.categories.name}
                          </span>
                        )}
                        <h3 className="font-display text-base font-semibold text-black mt-1 leading-snug group-hover:text-red-brand transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-mid mt-2 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        {post.published_at && (
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(post.published_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {inTheNewsPosts.length >= 4 && (
                  <div className="mt-4">
                    <Link
                      href={`/stories?search=${encodeURIComponent(biz.business_name)}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#c1121f] transition-colors"
                    >
                      View All Stories <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* ========== SIDEBAR (desktop only) ========== */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              {/* 1 — Mini Map Placeholder */}
              <div className="overflow-hidden border border-gray-200">
                <div className="bg-[#f5f5f5] flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <MapPin size={24} className="text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-400 uppercase tracking-widest">
                      Map Coming Soon
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-white text-sm text-[#333]">
                  {biz.street_address}, {biz.cities?.name}, {biz.state} {biz.zip_code}
                </div>
              </div>

              {/* 2 — Details block */}
              <div className="border border-gray-200 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#333] mb-4">
                  Business Details
                </h3>
                <DetailsBlock id="sidebar-details" />
              </div>

              {/* 3 — Price Range */}
              {biz.price_range && (
                <div className="border border-gray-200 p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-[#333] mb-2">
                    Price Range
                  </h4>
                  <span className="text-2xl font-display font-bold tracking-wide text-black">
                    {biz.price_range}
                  </span>
                </div>
              )}

              {/* 4 — Claim Listing (Free tier only) */}
              {biz.tier === "Free" && (
                <div className="border-2 border-dashed border-[#e6c46d]/40 bg-[#fee198]/10 p-5 text-center">
                  <h4 className="font-display text-lg font-semibold text-black mb-1">
                    Is this your business?
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Claim your listing to update info, add photos, and unlock
                    premium features.
                  </p>
                  <Link
                    href="/submit"
                    className="inline-block bg-[#c1121f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    Claim Your Listing
                  </Link>
                </div>
              )}

              {/* 5 — Contact Form */}
              <div className="border border-gray-200 p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#333] mb-3">
                  Contact This Business
                </h4>
                <ContactForm businessName={biz.business_name} />
              </div>
            </div>
          </aside>
        </div>

        {/* ============================================================
            MORE PLACES TO EXPLORE (full width, client component with arrows)
            ============================================================ */}
        <MorePlacesScroller
          places={morePlacesData}
          neighborhoodName={neighborhood?.name}
          neighborhoodSlug={neighborhood?.slug}
        />

        {/* ============================================================
            NEWSLETTER SIGNUP (full width, bottom)
            ============================================================ */}
        <section className="mt-8 mb-4 bg-[#1a1a1a] text-white p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-[#fee198]">
            Stay in the Loop
          </h2>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
            Get the latest on Atlanta businesses, events, and neighborhood
            stories delivered to your inbox.
          </p>
          <form
            action="#"
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#e6c46d]/50"
            />
            <button
              type="submit"
              className="bg-[#fee198] text-[#1a1a1a] font-semibold px-6 py-3 text-sm hover:bg-[#1a1a1a] hover:text-[#fee198] hover:ring-1 hover:ring-[#fee198] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
