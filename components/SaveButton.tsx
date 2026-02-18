"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const STORAGE_KEY = "avv-saved";

function getSavedSlugs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupted or unavailable localStorage — start fresh
  }
  return [];
}

function persistSavedSlugs(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function SaveButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const slugs = getSavedSlugs();
    if (slugs.includes(slug)) {
      setSaved(true);
    }
  }, [slug]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);

    const slugs = getSavedSlugs();
    if (next) {
      if (!slugs.includes(slug)) {
        persistSavedSlugs([...slugs, slug]);
      }
    } else {
      persistSavedSlugs(slugs.filter((s) => s !== slug));
    }
  };

  return (
    <button
      className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors z-20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c1121f] focus-visible:ring-offset-2"
      onClick={toggle}
      aria-label={saved ? "Unsave" : "Save"}
    >
      <Heart size={16} className={saved ? "fill-red-brand text-red-brand" : "text-gray-mid"} />
    </button>
  );
}
