"use client";

import { useState } from "react";
import Image from "next/image";

/* ============================================================
   HERO SECTION — shared hero block for hub + detail pages

   variant="split"   → Hub pages: 2-col grid (image left, text right)
   variant="overlay"  → Detail pages: full-width image with gradient overlay
   ============================================================ */

const FALLBACK_SRC = "/images/default-hero.png";

interface HeroSectionProps {
  backgroundImage: string;
  eyebrow: string;
  title: string;
  description?: string;
  variant?: "split" | "overlay";
  className?: string;
}

export function HeroSection({
  backgroundImage,
  eyebrow,
  title,
  description,
  variant = "split",
  className = "",
}: HeroSectionProps) {
  const [overlayLoaded, setOverlayLoaded] = useState(false);
  const [overlaySrc, setOverlaySrc] = useState(backgroundImage);

  const [desktopLoaded, setDesktopLoaded] = useState(false);
  const [desktopSrc, setDesktopSrc] = useState(backgroundImage);

  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [mobileSrc, setMobileSrc] = useState(backgroundImage);

  if (variant === "overlay") {
    return (
      <section className={`relative w-full ${className}`}>
        <div className="relative w-full h-[52vh] sm:h-[58vh] md:h-[65vh] min-h-[340px] max-h-[640px] overflow-hidden">
          {/* Loading skeleton */}
          {!overlayLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <Image
            src={overlaySrc}
            alt={title}
            fill
            className="object-cover"
            priority
            onLoad={() => setOverlayLoaded(true)}
            onError={() => setOverlaySrc(FALLBACK_SRC)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
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
        </div>
      </section>
    );
  }

  /* variant="split" — Hub pages */
  return (
    <>
      {/* Desktop hero */}
      <section className={`hidden lg:block bg-black ${className}`}>
        <div className="grid grid-cols-2 min-h-[480px]">
          <div className="relative overflow-hidden bg-[#111]">
            {/* Loading skeleton */}
            {!desktopLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={desktopSrc}
              alt={title}
              fill
              className="object-cover"
              priority
              onLoad={() => setDesktopLoaded(true)}
              onError={() => setDesktopSrc(FALLBACK_SRC)}
            />
          </div>
          <div className="flex flex-col justify-center px-16">
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
          </div>
        </div>
      </section>

      {/* Mobile hero */}
      <section className={`lg:hidden bg-black ${className}`}>
        <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
          {/* Loading skeleton */}
          {!mobileLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <Image
            src={mobileSrc}
            alt={title}
            fill
            className="object-cover"
            priority
            onLoad={() => setMobileLoaded(true)}
            onError={() => setMobileSrc(FALLBACK_SRC)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
          >
            <span className="text-[#e6c46d] text-[10px] font-semibold uppercase tracking-[0.15em]">
              {eyebrow}
            </span>
            <h1 className="font-display text-3xl font-semibold text-white leading-[1.1] mt-1">
              {title}
            </h1>
          </div>
        </div>
        <div className="px-4 py-5 bg-black">
          {description && (
            <p className="text-white/60 text-[13px]">{description}</p>
          )}
        </div>
      </section>
    </>
  );
}
