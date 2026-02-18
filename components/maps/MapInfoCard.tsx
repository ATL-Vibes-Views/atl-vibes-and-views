'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowRight, Store } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapInfoCardProps {
  type: 'area' | 'neighborhood';
  isOpen: boolean;
  onClose: () => void;

  area?: {
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    hero_image_url: string | null;
  };

  topNeighborhoods?: Array<{
    name: string;
    slug: string;
    post_count: number;
  }>;

  featuredBusiness?: {
    name: string;
    slug: string;
    featured_image_url: string | null;
    category_name: string;
  } | null;

  neighborhood?: {
    name: string;
    slug: string;
    tagline: string | null;
    hero_image_url: string | null;
    business_count: number;
    story_count: number;
  };
}

// Shared card wrapper classes — slides from left on desktop, bottom on mobile
const cardBase = `
  absolute z-10 bg-white border-r border-[#e5e5e5]
  transition-transform duration-300 ease-in-out overflow-y-auto
  left-0 top-0 bottom-0 w-[340px]
  max-md:left-0 max-md:right-0 max-md:top-auto max-md:bottom-0 max-md:w-full max-md:max-h-[70%] max-md:border-r-0 max-md:border-t max-md:border-[#e5e5e5]
`;

function cardTransform(isOpen: boolean) {
  return isOpen
    ? 'translate-x-0 max-md:translate-x-0 max-md:translate-y-0'
    : '-translate-x-full max-md:translate-x-0 max-md:translate-y-full';
}

// Right-edge shadow for desktop (left-sliding card)
const cardShadow: React.CSSProperties = {
  boxShadow: '8px 0 40px rgba(0,0,0,0.5)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapInfoCard({
  type,
  isOpen,
  onClose,
  area,
  topNeighborhoods,
  featuredBusiness,
  neighborhood,
}: MapInfoCardProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // -----------------------------------------------------------------------
  // Area card
  // -----------------------------------------------------------------------
  if (type === 'area' && area) {
    const heroUrl = area.hero_image_url;

    return (
      <div
        className={`${cardBase} ${cardTransform(isOpen)}`}
        style={cardShadow}
      >
        {/* Hero image */}
        <div className="relative h-[180px] w-full bg-[#1a1a1a]">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={area.name}
              fill
              className="object-cover"
              sizes="340px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-xl text-white/60">
                {area.name}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-sm hover:bg-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-4">
          <h3 className="font-display text-2xl font-bold text-[#1a1a1a]">
            {area.name}
          </h3>
          {area.tagline && (
            <p className="mt-1 text-[13px] text-gray-500">{area.tagline}</p>
          )}

          {/* Top neighborhoods */}
          {topNeighborhoods && topNeighborhoods.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#c1121f]">
                Top Neighborhoods
              </p>
              <ul className="mt-2 space-y-1.5">
                {topNeighborhoods.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/neighborhoods/${n.slug}`}
                      className="flex items-center gap-1.5 text-[13px] text-[#1a1a1a] hover:text-[#c1121f]"
                    >
                      <span className="text-[8px] text-gray-400">&#9679;</span>
                      {n.name}
                      <span className="text-gray-400">
                        ({n.post_count} {n.post_count === 1 ? 'story' : 'stories'})
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Featured business */}
          {featuredBusiness && (
            <Link
              href={`/places/${featuredBusiness.slug}`}
              className="mt-5 block border border-[#e5e5e5] bg-[#f5f5f5] p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Featured
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 bg-[#e5e5e5]">
                  {featuredBusiness.featured_image_url ? (
                    <Image
                      src={featuredBusiness.featured_image_url}
                      alt={featuredBusiness.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <Store size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[#1a1a1a]">
                    {featuredBusiness.name}
                  </p>
                  <span className="inline-block mt-0.5 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-500 border border-[#e5e5e5]">
                    {featuredBusiness.category_name}
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Explore button */}
          <Link
            href={`/areas/${area.slug}`}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#fee198] px-4 py-2.5 text-sm font-medium text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
          >
            Explore {area.name}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Neighborhood card
  // -----------------------------------------------------------------------
  if (type === 'neighborhood' && neighborhood) {
    const heroUrl = neighborhood.hero_image_url;

    return (
      <div
        className={`${cardBase} ${cardTransform(isOpen)}`}
        style={cardShadow}
      >
        {/* Hero image */}
        <div className="relative h-[160px] w-full bg-[#1a1a1a]">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={neighborhood.name}
              fill
              className="object-cover"
              sizes="340px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-lg text-white/60">
                {neighborhood.name}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-sm hover:bg-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-4">
          <h3 className="font-display text-[22px] font-bold text-[#1a1a1a]">
            {neighborhood.name}
          </h3>
          {neighborhood.tagline && (
            <p className="mt-1 text-[13px] text-gray-500">
              {neighborhood.tagline}
            </p>
          )}

          {/* Stats */}
          <p className="mt-3 text-[13px] text-gray-400">
            {neighborhood.business_count} {neighborhood.business_count === 1 ? 'business' : 'businesses'}
            {' · '}
            {neighborhood.story_count} {neighborhood.story_count === 1 ? 'story' : 'stories'}
          </p>

          {/* Explore button */}
          <Link
            href={`/neighborhoods/${neighborhood.slug}`}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#fee198] px-4 py-2.5 text-sm font-medium text-[#1a1a1a] hover:bg-[#fdd870] transition-colors"
          >
            Explore {neighborhood.name}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
