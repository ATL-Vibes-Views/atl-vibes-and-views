/* ============================================================
   NEWSLETTER COLOR MAP
   Maps newsletter_types.name → display config (colors, labels)

   The `name` field in the `newsletters` table corresponds to
   `newsletter_types.name`. This map uses the display name as key
   and provides the slug for URL params.
   ============================================================ */

export interface NewsletterColorConfig {
  label: string;
  borderColor: string;
  labelColor: string;
  frequency: string;
  filterSlug: string;
}

/**
 * Map from newsletter_types.name → visual config.
 * Keys match the `name` column value exactly.
 * If a newsletter name isn't found here, we fall back to gray.
 */
export const NEWSLETTER_COLORS: Record<string, NewsletterColorConfig> = {
  "The A-List Weekly Brief": {
    label: "The A-List Weekly Brief",
    borderColor: "#fee198",
    labelColor: "#b8860b",
    frequency: "Weekly",
    filterSlug: "weekly-brief",
  },
  "On the Menu": {
    label: "On the Menu",
    borderColor: "#c1121f",
    labelColor: "#c1121f",
    frequency: "Biweekly",
    filterSlug: "on-the-menu",
  },
  "Atlanta Events": {
    label: "Atlanta Events",
    borderColor: "#2a9d8f",
    labelColor: "#2a9d8f",
    frequency: "Biweekly",
    filterSlug: "events",
  },
  "Real Estate Snapshot": {
    label: "Real Estate Snapshot",
    borderColor: "#1d3557",
    labelColor: "#1d3557",
    frequency: "Monthly",
    filterSlug: "real-estate",
  },
  "Atlanta Development Brief": {
    label: "Atlanta Development Brief",
    borderColor: "#457b9d",
    labelColor: "#457b9d",
    frequency: "Monthly",
    filterSlug: "development",
  },
  "ATL Entrepreneurial Resources": {
    label: "ATL Entrepreneurial Resources",
    borderColor: "#c77b3c",
    labelColor: "#c77b3c",
    frequency: "Monthly",
    filterSlug: "entrepreneurial",
  },
};

/** Default fallback for unknown newsletter types */
const DEFAULT_CONFIG: NewsletterColorConfig = {
  label: "Newsletter",
  borderColor: "#999",
  labelColor: "#999",
  frequency: "Periodic",
  filterSlug: "other",
};

/** Get color config by newsletter name */
export function getNewsletterColor(name: string): NewsletterColorConfig {
  return NEWSLETTER_COLORS[name] ?? DEFAULT_CONFIG;
}

/** Get color config by filter slug (for URL param matching) */
export function getNewsletterColorBySlug(
  slug: string
): NewsletterColorConfig | undefined {
  return Object.values(NEWSLETTER_COLORS).find(
    (c) => c.filterSlug === slug
  );
}

/** Build filter tabs from newsletter_types or distinct names */
export function buildFilterTabs(
  newsletters: { name: string }[]
): { slug: string; name: string; count: number; color: NewsletterColorConfig }[] {
  const countMap = new Map<string, number>();
  for (const nl of newsletters) {
    countMap.set(nl.name, (countMap.get(nl.name) ?? 0) + 1);
  }

  const tabs: {
    slug: string;
    name: string;
    count: number;
    color: NewsletterColorConfig;
  }[] = [];

  for (const [name, count] of countMap) {
    const color = getNewsletterColor(name);
    tabs.push({
      slug: color.filterSlug,
      name: color.label,
      count,
      color,
    });
  }

  /* Sort by the order they appear in NEWSLETTER_COLORS */
  const order = Object.keys(NEWSLETTER_COLORS);
  tabs.sort((a, b) => {
    const ai = order.indexOf(
      Object.keys(NEWSLETTER_COLORS).find(
        (k) => NEWSLETTER_COLORS[k].filterSlug === a.slug
      ) ?? ""
    );
    const bi = order.indexOf(
      Object.keys(NEWSLETTER_COLORS).find(
        (k) => NEWSLETTER_COLORS[k].filterSlug === b.slug
      ) ?? ""
    );
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return tabs;
}
