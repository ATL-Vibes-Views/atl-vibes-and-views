"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { FallbackPlaceholder } from "./AdPlacement";

/* ============================================================
   AD PLACEMENT CLIENT — For use inside "use client" components
   Same flight-chain query via RPC, rendered client-side.
   ============================================================ */

interface AdPlacementClientProps {
  placementKey: string;
  variant?: "sidebar" | "inline" | "horizontal";
  className?: string;
  neighborhoodId?: string;
  areaId?: string;
  categoryId?: string;
}

interface AdCreative {
  flight_id: string;
  creative_type: string;
  headline: string | null;
  body: string | null;
  cta_text: string | null;
  target_url: string;
  image_url: string | null;
  alt_text: string | null;
  utm_campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
}

export function AdPlacementClient({
  placementKey,
  variant = "sidebar",
  className = "",
  neighborhoodId,
  areaId,
  categoryId,
}: AdPlacementClientProps) {
  const [ad, setAd] = useState<AdCreative | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    (supabase.rpc as Function)("get_active_ad", {
        p_placement_key: placementKey,
        p_neighborhood_id: neighborhoodId || null,
        p_area_id: areaId || null,
        p_category_id: categoryId || null,
      })
      .then(({ data }: { data: unknown }) => {
        const row = (data as AdCreative[] | null)?.[0];
        if (row?.target_url) setAd(row);
        setLoaded(true);
      });
  }, [placementKey, neighborhoodId, areaId, categoryId]);

  if (!loaded || !ad) {
    return (
      <FallbackPlaceholder
        variant={variant}
        className={className}
        placementKey={placementKey}
      />
    );
  }

  // Build UTM-tagged URL
  const url = new URL(ad.target_url);
  if (ad.utm_campaign) url.searchParams.set("utm_campaign", ad.utm_campaign);
  if (ad.utm_source) url.searchParams.set("utm_source", ad.utm_source);
  if (ad.utm_medium) url.searchParams.set("utm_medium", ad.utm_medium);

  if (ad.creative_type === "image" && ad.image_url) {
    return (
      <div className={className} data-placement={placementKey}>
        <a
          href={url.toString()}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
        >
          <img
            src={ad.image_url}
            alt={ad.alt_text || ad.headline || "Sponsored"}
            className="w-full h-auto"
          />
          {ad.headline && (
            <p className="text-[11px] text-[#737373] mt-1 text-center">
              Sponsored &middot; {ad.headline}
            </p>
          )}
        </a>
      </div>
    );
  }

  if (ad.creative_type === "html" && ad.body) {
    return (
      <div
        className={className}
        data-placement={placementKey}
        dangerouslySetInnerHTML={{ __html: ad.body }}
      />
    );
  }

  return (
    <FallbackPlaceholder
      variant={variant}
      className={className}
      placementKey={placementKey}
    />
  );
}
