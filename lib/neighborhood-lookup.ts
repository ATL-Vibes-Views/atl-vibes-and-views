import * as turf from "@turf/turf";
import geojsonData from "../public/data/atlanta-neighborhoods.geojson";

export function findNeighborhoodByCoordinates(lat: number, lng: number): string | null {
  const point = turf.point([lng, lat]);

  for (const feature of (geojsonData as any).features) {
    if (!feature.geometry) continue;
    try {
      if (turf.booleanPointInPolygon(point, feature)) {
        return feature.properties?.NAME ?? null;
      }
    } catch {
      continue;
    }
  }
  return null;
}
