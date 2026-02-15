import { createServerClient } from "@/lib/supabase";

/* ============================================================
   AD PLACEMENT — Server Component
   Queries Supabase for an active ad flight via RPC, renders
   the creative or falls back to the standard placeholder.
   ============================================================ */

interface AdPlacementProps {
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

export default async function AdPlacement({
  placementKey,
  variant = "sidebar",
  className = "",
  neighborhoodId,
  areaId,
  categoryId,
}: AdPlacementProps) {
  const supabase = createServerClient();

  const { data: creative } = (await (supabase.rpc as Function)("get_active_ad", {
    p_placement_key: placementKey,
    p_neighborhood_id: neighborhoodId || null,
    p_area_id: areaId || null,
    p_category_id: categoryId || null,
  })) as { data: AdCreative[] | null };

  const ad = creative?.[0];

  if (!ad || !ad.target_url) {
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

/* ── Fallback — matches existing "ADVERTISE HERE" visual ── */
export function FallbackPlaceholder({
  variant,
  className = "",
  placementKey,
}: {
  variant: "sidebar" | "inline" | "horizontal";
  className?: string;
  placementKey?: string;
}) {
  if (variant === "horizontal") {
    return (
      <div className={`max-w-[1280px] mx-auto px-6 ${className}`} data-placement={placementKey}>
        <div className="w-full h-[120px] bg-gray-light border border-dashed border-gray-mid flex items-center justify-center">
          <div className="text-center">
            <span className="text-[11px] text-gray-mid uppercase tracking-widest">
              Advertise Here
            </span>
            <p className="text-[10px] text-gray-400 mt-1">
              Reach thousands of Atlanta locals
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center py-12 border border-dashed border-gray-300 ${className}`}
        data-placement={placementKey}
      >
        <div className="text-center">
          <span className="text-xs text-gray-mid uppercase tracking-eyebrow">
            Advertise Here
          </span>
          <p className="text-sm text-gray-400 mt-1">
            Reach thousands of Atlanta locals
          </p>
        </div>
      </div>
    );
  }

  /* variant="sidebar" */
  return (
    <div
      className={`bg-gray-light hover:bg-gray-100 transition-colors ${className}`}
      data-placement={placementKey}
    >
      <div className="w-[300px] h-[250px] flex items-center justify-center border border-dashed border-gray-mid/30 mx-auto">
        <div className="text-center">
          <span className="text-xs text-gray-mid uppercase tracking-eyebrow">
            Advertise Here
          </span>
          <p className="text-[10px] text-gray-400 mt-1">Reach Atlanta locals</p>
        </div>
      </div>
    </div>
  );
}
