import * as turf from "@turf/turf";

let cachedGeojson: any = null;

async function getGeojson() {
  if (cachedGeojson) return cachedGeojson;
  const res = await fetch("/data/atlanta-neighborhoods.geojson");
  cachedGeojson = await res.json();
  return cachedGeojson;
}

export async function findNeighborhoodByCoordinates(lat: number, lng: number): Promise<string | null> {
  const geojson = await getGeojson();
  const point = turf.point([lng, lat]);
  for (const feature of geojson.features) {
    if (!feature.geometry) continue;
    try {
      if (turf.booleanPointInPolygon(point, feature)) {
        return feature.properties?.NAME ?? null;
      }
    } catch { continue; }
  }
  return null;
}
