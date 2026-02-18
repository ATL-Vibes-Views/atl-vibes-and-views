export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
export const MAPBOX_STYLE = 'mapbox://styles/mellanda/cmloinh8v001p01qnc5eq0qjs';

// Default map center (Atlanta)
export const ATLANTA_CENTER = { lng: -84.388, lat: 33.749 };
export const ATLANTA_ZOOM = 11;

// Area colors — monochromatic gold for polygon fills and borders
export const AREA_COLORS: Record<string, string> = {
  'buckhead': '#c4a24d',
  'midtown': '#c4a24d',
  'downtown': '#c4a24d',
  'eastside': '#c4a24d',
  'westside': '#c4a24d',
  'north-atlanta': '#c4a24d',
  'south-atlanta': '#c4a24d',
  'southeast-atlanta': '#c4a24d',
  'southwest-atlanta': '#c4a24d',
};

// Fallback color for unknown areas
export const DEFAULT_AREA_COLOR = '#c4a24d';
