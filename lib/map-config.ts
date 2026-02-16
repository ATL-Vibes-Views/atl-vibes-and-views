export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11';

// Default map center (Atlanta)
export const ATLANTA_CENTER = { lng: -84.388, lat: 33.749 };
export const ATLANTA_ZOOM = 11;

// Area colors — used for polygon fills and borders
export const AREA_COLORS: Record<string, string> = {
  'buckhead': '#9b59b6',
  'midtown': '#3498db',
  'downtown': '#e74c3c',
  'eastside': '#2ecc71',
  'westside': '#f39c12',
  'north-atlanta': '#1abc9c',
  'south-atlanta': '#e67e22',
  'southeast-atlanta': '#00bcd4',
  'southwest-atlanta': '#8bc34a',
};

// Fallback color for unknown areas
export const DEFAULT_AREA_COLOR = '#95a5a6';
