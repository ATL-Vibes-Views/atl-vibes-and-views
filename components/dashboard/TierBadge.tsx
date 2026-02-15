export type BusinessState = "free" | "standard" | "founding" | "sponsor";

interface TierBadgeProps {
  state: BusinessState;
}

const badgeConfig: Record<BusinessState, { text: string; classes: string }> = {
  free: {
    text: "Free",
    classes: "bg-[#e5e7eb] text-[#374151]",
  },
  standard: {
    text: "Standard",
    classes: "bg-[#dbeafe] text-[#2563eb]",
  },
  founding: {
    text: "Founding Member",
    classes: "bg-[#ede9fe] text-[#7c3aed]",
  },
  sponsor: {
    text: "Partner",
    classes: "bg-[#dcfce7] text-[#16a34a]",
  },
};

export function TierBadge({ state }: TierBadgeProps) {
  const config = badgeConfig[state];
  return (
    <span
      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${config.classes}`}
    >
      {config.text}
    </span>
  );
}

export function getBusinessState(
  business: { tier?: string; is_founding_member?: boolean } | null,
  sponsor: { is_active?: boolean } | null
): BusinessState {
  if (sponsor && sponsor.is_active) return "sponsor";
  if (business?.is_founding_member) return "founding";
  if (business?.tier === "Standard") return "standard";
  return "free";
}
