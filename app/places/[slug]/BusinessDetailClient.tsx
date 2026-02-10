"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  PenLine,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

/* =============================================================
   TYPES
   ============================================================= */
type BusinessImage = {
  id: string;
  image_url: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
};

type MorePlace = {
  id: string;
  slug: string;
  business_name: string;
  logo: string | null;
  neighborhoods: { name: string } | null;
  categories: { name: string } | null;
  imageUrl: string;
};

/* =============================================================
   QUICK INFO STRIP
   Rating summary + Save / Share / Write Review (UI-only)
   ============================================================= */
export function QuickInfoStrip({
  avgRating,
  reviewCount,
  tier,
}: {
  avgRating: number | null;
  reviewCount: number;
  tier?: string;
}) {
  const [saved, setSaved] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }

  function handleWriteReview() {
    const el = document.getElementById("reviews-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {/* LEFT: Rating + Claim Listing */}
      <div className="flex items-center gap-3">
        {avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    s <= Math.round(avgRating)
                      ? "fill-[#fee198] text-[#fee198]"
                      : "text-white/30"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-medium text-white/90">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-white/60">({reviewCount})</span>
          </div>
        )}
        {tier === "Free" && (
          <a
            href="/submit"
            className="flex items-center gap-1.5 bg-[#fee198] px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fee198] transition-colors"
          >
            Claim Listing
          </a>
        )}
      </div>

      {/* RIGHT: Save / Share / Write Review */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setSaved(!saved)}
          className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors"
        >
          <Heart
            size={14}
            className={saved ? "fill-[#c1121f] text-[#c1121f]" : ""}
          />
          {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors"
        >
          <Share2 size={14} />
          Share
        </button>
        <button
          onClick={handleWriteReview}
          className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors"
        >
          <PenLine size={14} />
          Write Review
        </button>
      </div>
    </div>
  );
}

/* =============================================================
   PHOTO GALLERY with Lightbox
   ============================================================= */
export function PhotoGallery({ images }: { images: BusinessImage[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIdx(i)}
            className={`relative overflow-hidden aspect-[4/3] group ${
              i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : ""
            }`}
          >
            <Image
              src={img.image_url}
              alt={img.alt_text || img.caption || "Business photo"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx(null);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X size={28} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(
                    lightboxIdx === 0 ? images.length - 1 : lightboxIdx - 1
                  );
                }}
                className="absolute left-4 text-white/80 hover:text-white z-10"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(
                    lightboxIdx === images.length - 1 ? 0 : lightboxIdx + 1
                  );
                }}
                className="absolute right-4 text-white/80 hover:text-white z-10"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          <div
            className="relative w-[90vw] h-[80vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIdx].image_url}
              alt={
                images[lightboxIdx].alt_text ||
                images[lightboxIdx].caption ||
                "Business photo"
              }
              fill
              className="object-contain"
              sizes="90vw"
            />
            {images[lightboxIdx].caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-3 text-center">
                {images[lightboxIdx].caption}
              </p>
            )}
          </div>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

/* =============================================================
   MORE PLACES SCROLLER with arrows
   ============================================================= */
export function MorePlacesScroller({
  places,
  neighborhoodName,
  neighborhoodSlug,
}: {
  places: MorePlace[];
  neighborhoodName?: string;
  neighborhoodSlug?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (!places.length) return null;

  return (
    <section className="mt-16 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-black">
          More Places to Explore
        </h2>
        <div className="flex items-center gap-3">
          {neighborhoodName && neighborhoodSlug && (
            <Link
              href={`/neighborhoods/${neighborhoodSlug}`}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#c1121f] hover:text-black transition-colors"
            >
              Explore {neighborhoodName}
            </Link>
          )}
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center border border-[#fee198] text-[#fee198] hover:bg-[#fee198] hover:text-[#1a1a1a] transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center border border-[#fee198] text-[#fee198] hover:bg-[#fee198] hover:text-[#1a1a1a] transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide"
      >
        {places.map((place) => (
          <Link
            key={place.id}
            href={`/places/${place.slug}`}
            className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start group"
          >
            <div className="relative aspect-[4/3] overflow-hidden mb-2">
              <Image
                src={place.imageUrl}
                alt={place.business_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="280px"
              />
              {place.categories && (
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white rounded-full">
                  {place.categories.name}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold text-black group-hover:text-[#c1121f] transition-colors leading-tight">
              {place.business_name}
            </h3>
            {place.neighborhoods && (
              <p className="text-xs text-gray-500 mt-0.5">
                {place.neighborhoods.name}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =============================================================
   CONTACT FORM
   ============================================================= */
export function ContactForm({ businessName }: { businessName: string }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-[#e6c46d]/30 bg-[#fee198]/10 p-6 text-center">
        <p className="font-display text-lg font-semibold text-black">
          Message sent!
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {businessName} will receive your inquiry.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Your name"
        required
        value={formState.name}
        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
        className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e6c46d]/50"
      />
      <input
        type="email"
        placeholder="Your email"
        required
        value={formState.email}
        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
        className="w-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e6c46d]/50"
      />
      <textarea
        placeholder={`Message to ${businessName}...`}
        required
        rows={4}
        value={formState.message}
        onChange={(e) =>
          setFormState({ ...formState, message: e.target.value })
        }
        className="w-full border border-gray-300 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#e6c46d]/50"
      />
      <button
        type="submit"
        className="w-full bg-[#fee198] text-[#1a1a1a] font-semibold py-3 text-sm tracking-wide hover:bg-[#1a1a1a] hover:text-[#fee198] transition-colors duration-200"
      >
        Send Message
      </button>
    </form>
  );
}

/* =============================================================
   STAR RATING (static display) — #fee198
   ============================================================= */
export function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "fill-[#fee198] text-[#fee198]"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}
