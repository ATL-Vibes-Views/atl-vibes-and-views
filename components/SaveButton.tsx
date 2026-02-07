"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export function SaveButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors z-20 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(!saved);
      }}
      aria-label={saved ? "Unsave" : "Save"}
    >
      <Heart size={16} className={saved ? "fill-red-brand text-red-brand" : "text-gray-mid"} />
    </button>
  );
}
