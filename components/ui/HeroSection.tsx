"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PH_DEFAULT } from "@/lib/placeholders";

/* ============================================================
   HERO SECTION — shared hero block for hub + detail pages

   variant="split"   → Hub pages: 2-col grid (image left, text right)
   variant="overlay"  → Detail pages: full-width image with gradient overlay

   heroType="image"  → background image (default)
   heroType="video"  → autoplay video background
   heroType="post"   → featured blog post (image bg + post meta overlay)
   ============================================================ */

const FALLBACK_SRC = PH_DEFAULT;

export interface HeroPost {
  title: string;
  slug: string;
  featured_image_url?: string | null;
  author?: string | null;
  published_at?: string | null;
  category?: string | null;
}

interface HeroSectionProps {
  backgroundImage?: string;
  eyebrow: string;
  title: string;
  description?: string;
  variant?: "split" | "overlay";
  className?: string;
  heroType?: "image" | "video" | "post" | "featured_post";
  videoUrl?: string;
  heroPost?: HeroPost | null;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function HeroSection({
  backgroundImage,
  eyebrow,
  title,
  description,
  variant = "split",
  className = "",
  heroType = "image",
  videoUrl,
  heroPost,
}: HeroSectionProps) {
  const effectiveType =
    heroType === "video" && videoUrl ? "video" :
    (heroType === "post" || heroType === "featured_post") && heroPost ? "post" :
    "image";

  const bgSrc = effectiveType === "post"
    ? (heroPost?.featured_image_url ?? FALLBACK_SRC)
    : (backgroundImage ?? FALLBACK_SRC);

  const [overlayLoaded, setOverlayLoaded] = useState(false);
  const [overlaySrc, setOverlaySrc] = useState(bgSrc);

  const [desktopLoaded, setDesktopLoaded] = useState(false);
  const [desktopSrc, setDesktopSrc] = useState(bgSrc);

  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [mobileSrc, setMobileSrc] = useState(bgSrc);

  /* ── Shared media element (image or video) ── */
  function MediaEl({ src, onLoad, onError, className: cls }: {
    src: string;
    onLoad?: () => void;
    onError?: () => void;
    className?: string;
  }) {
    if (effectiveType === "video" && videoUrl) {
      return (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${cls ?? ""}`}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={effectiveType === "post" ? (heroPost?.title ?? title) : title}
        fill
        className={`object-cover ${cls ?? ""}`}
        priority
        onLoad={onLoad}
        onError={onError}
        unoptimized
      />
    );
  }

  if (variant === "overlay") {
    const inner = (
      <section className={`relative w-full ${effectiveType === "post" ? "cursor-pointer group" : ""} ${className}`}>
        <div className="relative w-full h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] overflow-hidden">
          {effectiveType === "image" && !overlayLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <MediaEl
            src={overlaySrc}
            onLoad={() => setOverlayLoaded(true)}
            onError={() => setOverlaySrc(FALLBACK_SRC)}
            className={effectiveType === "post" ? "transition-transform duration-700 group-hover:scale-105" : ""}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {effectiveType === "post" && heroPost ? (
            <>
              {heroPost.category && (
                <span className="inline-block bg-[#fee198] text-[#1a1a1a] text-[11px] font-semibold uppercase tracking-[0.12em] px-3 py-1 mb-4">
                  {heroPost.category}
                </span>
              )}
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white max-w-4xl">
                {heroPost.title}
              </h1>
              {(heroPost.author || heroPost.published_at) && (
                <p className="text-white/70 text-sm mt-3">
                  {heroPost.author ? `BY ${heroPost.author.toUpperCase()}` : ""}
                  {heroPost.author && heroPost.published_at ? " · " : ""}
                  {formatDate(heroPost.published_at)}
                </p>
              )}
              <p className="text-white/70 text-sm hover:text-white transition-colors mt-2">
                Read Story →
              </p>
            </>
          ) : (
            <>
              <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
                {eyebrow}
              </span>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white">
                {title}
              </h1>
              {description && (
                <p className="text-white/70 text-sm md:text-base mt-3 max-w-xl">
                  {description}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    );

    if (effectiveType === "post" && heroPost) {
      return <Link href={`/stories/${heroPost.slug}`}>{inner}</Link>;
    }
    return inner;
  }

  /* variant="split" — Hub pages */
  const splitInner = (
    <>
      {/* Desktop hero */}
      <section className={`hidden lg:block bg-black ${effectiveType === "post" ? "cursor-pointer group" : ""} ${className}`}>
        <div className="grid grid-cols-2 min-h-[480px]">
          <div className="relative overflow-hidden bg-[#111]">
            {effectiveType === "image" && !desktopLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <MediaEl
              src={desktopSrc}
              onLoad={() => setDesktopLoaded(true)}
              onError={() => setDesktopSrc(FALLBACK_SRC)}
              className={effectiveType === "post" ? "transition-transform duration-700 group-hover:scale-105" : ""}
            />
          </div>
          <div className="flex flex-col justify-center px-16">
            {effectiveType === "post" && heroPost ? (
              <>
                {heroPost.category && (
                  <span className="inline-block bg-[#fee198] text-[#1a1a1a] text-[11px] font-semibold uppercase tracking-[0.12em] px-3 py-1 mb-4 self-start">
                    {heroPost.category}
                  </span>
                )}
                <h1 className="font-display text-[56px] font-semibold text-white leading-[1.05]">
                  {heroPost.title}
                </h1>
                {(heroPost.author || heroPost.published_at) && (
                  <p className="text-white/70 text-[13px] mt-3">
                    {heroPost.author ? `BY ${heroPost.author.toUpperCase()}` : ""}
                    {heroPost.author && heroPost.published_at ? " · " : ""}
                    {formatDate(heroPost.published_at)}
                  </p>
                )}
                <p className="text-white/70 text-sm hover:text-white transition-colors mt-2">
                  Read Story →
                </p>
              </>
            ) : (
              <>
                <span className="text-[#e6c46d] text-[11px] font-semibold uppercase tracking-[0.15em] mb-4">
                  {eyebrow}
                </span>
                <h1 className="font-display text-[56px] font-semibold text-white leading-[1.05]">
                  {title}
                </h1>
                {description && (
                  <p className="text-white/60 text-[15px] mt-4 max-w-[420px] leading-relaxed">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile hero */}
      <section className={`lg:hidden bg-black ${effectiveType === "post" ? "cursor-pointer group" : ""} ${className}`}>
        <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
          {effectiveType === "image" && !mobileLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <MediaEl
            src={mobileSrc}
            onLoad={() => setMobileLoaded(true)}
            onError={() => setMobileSrc(FALLBACK_SRC)}
            className={effectiveType === "post" ? "transition-transform duration-700 group-hover:scale-105" : ""}
          />
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
          >
            {effectiveType === "post" && heroPost ? (
              <>
                {heroPost.category && (
                  <span className="inline-block bg-[#c1121f] text-white text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 mb-2">
                    {heroPost.category}
                  </span>
                )}
                <h1 className="font-display text-3xl font-semibold text-white leading-[1.1] mt-1">
                  {heroPost.title}
                </h1>
              </>
            ) : (
              <>
                <span className="text-[#e6c46d] text-[10px] font-semibold uppercase tracking-[0.15em]">
                  {eyebrow}
                </span>
                <h1 className="font-display text-3xl font-semibold text-white leading-[1.1] mt-1">
                  {title}
                </h1>
              </>
            )}
          </div>
        </div>
        <div className="px-4 py-5 bg-black">
          {effectiveType === "post" && heroPost ? (
            <>
              {(heroPost.author || heroPost.published_at) && (
                <p className="text-white/70 text-[12px]">
                  {heroPost.author ? `BY ${heroPost.author.toUpperCase()}` : ""}
                  {heroPost.author && heroPost.published_at ? " · " : ""}
                  {formatDate(heroPost.published_at)}
                </p>
              )}
              <p className="text-white/70 text-sm mt-1">Read Story →</p>
            </>
          ) : (
            description && (
              <p className="text-white/60 text-[13px]">{description}</p>
            )
          )}
        </div>
      </section>
    </>
  );

  if (effectiveType === "post" && heroPost) {
    return <Link href={`/stories/${heroPost.slug}`}>{splitInner}</Link>;
  }
  return splitInner;
}
