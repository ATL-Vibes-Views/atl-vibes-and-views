'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MapGL, { Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
import type {
  FillLayerSpecification,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from 'mapbox-gl';
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';

import {
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  ATLANTA_CENTER,
  ATLANTA_ZOOM,
  AREA_COLORS,
  DEFAULT_AREA_COLOR,
} from '@/lib/map-config';
import MapInfoCard from './MapInfoCard';
import type { AreaCardData, NeighborhoodCardData } from '@/lib/queries/map-card-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AreaMapProps {
  mode: 'areas' | 'neighborhoods' | 'single-neighborhood';
  areaSlug?: string;
  neighborhoodSlug?: string;
  areas?: Array<{
    id: string;
    name: string;
    slug: string;
    map_center_lat: number;
    map_center_lng: number;
  }>;
  neighborhoods?: Array<{
    id: string;
    name: string;
    slug: string;
    area_id: string;
    geojson_key: string | null;
    map_center_lat: number;
    map_center_lng: number;
  }>;
  height?: string;
  onAreaClick?: (areaSlug: string) => void;
  onNeighborhoodClick?: (neighborhoodSlug: string) => void;
  center?: { lng: number; lat: number };
  zoom?: number;
  showLabels?: boolean;

  /** Pre-fetched area card data keyed by area slug (for areas mode). */
  areaCardData?: Record<string, AreaCardData>;
  /** Pre-fetched neighborhood card data keyed by neighborhood slug (for neighborhoods mode). */
  neighborhoodCardData?: Record<string, NeighborhoodCardData>;
}

interface NeighborhoodProperties {
  NAME: string;
  NPU?: string;
  ACRES?: number;
  SQMILES?: number;
  areaSlug?: string;
  areaColor?: string;
  slug?: string;
  label?: string;
}

type AreaEntry = NonNullable<AreaMapProps['areas']>[number];
type NeighborhoodEntry = NonNullable<AreaMapProps['neighborhoods']>[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeCentroid(geometry: Polygon | MultiPolygon): [number, number] {
  const coords =
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0][0];
  let sumLng = 0;
  let sumLat = 0;
  for (const [lng, lat] of coords) {
    sumLng += lng;
    sumLat += lat;
  }
  return [sumLng / coords.length, sumLat / coords.length];
}

// ---------------------------------------------------------------------------
// Layer styles
// ---------------------------------------------------------------------------

function makeFillLayer(
  hoveredId: string | null,
): Omit<FillLayerSpecification, 'source'> & { id: string } {
  return {
    id: 'area-fill',
    type: 'fill' as const,
    paint: {
      'fill-color': ['get', 'areaColor'] as unknown as string,
      'fill-opacity': [
        'case',
        ['==', ['get', 'slug'], hoveredId ?? ''],
        0.5,
        0.25,
      ] as unknown as number,
    },
  };
}

const lineLayer: Omit<LineLayerSpecification, 'source'> & { id: string } = {
  id: 'area-line',
  type: 'line' as const,
  paint: {
    'line-color': ['get', 'areaColor'] as unknown as string,
    'line-width': 1.5,
    'line-opacity': 0.8,
  },
};

const labelLayer: Omit<SymbolLayerSpecification, 'source'> & { id: string } = {
  id: 'area-labels',
  type: 'symbol' as const,
  layout: {
    'text-field': ['get', 'label'] as unknown as string,
    'text-size': 13,
    'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
    'text-anchor': 'center',
    'text-allow-overlap': false,
    'text-ignore-placement': false,
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 1.5,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AreaMap({
  mode,
  areaSlug,
  neighborhoodSlug,
  areas = [],
  neighborhoods = [],
  height = '500px',
  onAreaClick,
  onNeighborhoodClick,
  center,
  zoom,
  showLabels = true,
  areaCardData = {},
  neighborhoodCardData = {},
}: AreaMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [labelGeojson, setLabelGeojson] = useState<FeatureCollection | null>(
    null,
  );
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Info card state
  const [cardOpen, setCardOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // Build lookup maps (using plain objects to avoid Map/MapGL name clash)
  const areaById = useMemo(() => {
    const lookup: Record<string, AreaEntry> = {};
    for (const a of areas) lookup[a.id] = a;
    return lookup;
  }, [areas]);

  const neighborhoodByGeoKey = useMemo(() => {
    const lookup: Record<string, NeighborhoodEntry> = {};
    for (const n of neighborhoods) {
      if (n.geojson_key) lookup[n.geojson_key] = n;
    }
    return lookup;
  }, [neighborhoods]);

  const getAreaSlug = useCallback(
    (n: NeighborhoodEntry) => {
      const area = areaById[n.area_id];
      return area?.slug ?? '';
    },
    [areaById],
  );

  // -----------------------------------------------------------------------
  // Load and process GeoJSON
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/data/atlanta-neighborhoods.geojson');
        const raw: FeatureCollection = await res.json();

        if (cancelled) return;

        const enriched: Feature<Polygon | MultiPolygon, NeighborhoodProperties>[] = [];
        const labelPoints: Feature[] = [];

        const areaCentroids: Record<
          string,
          { lngSum: number; latSum: number; count: number; name: string }
        > = {};

        for (const feature of raw.features) {
          const name = (feature.properties as Record<string, unknown>)
            ?.NAME as string | undefined;
          if (!name) continue;

          const nbr = neighborhoodByGeoKey[name];
          if (!nbr) continue;

          const nAreaSlug = getAreaSlug(nbr);
          const color = AREA_COLORS[nAreaSlug] ?? DEFAULT_AREA_COLOR;
          const area = areaById[nbr.area_id];

          if (mode === 'neighborhoods' && nAreaSlug !== areaSlug) continue;
          if (mode === 'single-neighborhood' && nbr.slug !== neighborhoodSlug)
            continue;

          enriched.push({
            ...feature,
            geometry: feature.geometry as Polygon | MultiPolygon,
            properties: {
              ...(feature.properties as NeighborhoodProperties),
              areaSlug: nAreaSlug,
              areaColor: color,
              slug: mode === 'areas' ? nAreaSlug : nbr.slug,
              label: mode === 'areas' ? (area?.name ?? nAreaSlug) : nbr.name,
            },
          });

          if (mode === 'areas') {
            const centroid = computeCentroid(
              feature.geometry as Polygon | MultiPolygon,
            );
            const existing = areaCentroids[nAreaSlug];
            if (existing) {
              existing.lngSum += centroid[0];
              existing.latSum += centroid[1];
              existing.count += 1;
            } else {
              areaCentroids[nAreaSlug] = {
                lngSum: centroid[0],
                latSum: centroid[1],
                count: 1,
                name: area?.name ?? nAreaSlug,
              };
            }
          } else {
            const centroid = computeCentroid(
              feature.geometry as Polygon | MultiPolygon,
            );
            labelPoints.push({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: centroid },
              properties: { label: nbr.name },
            });
          }
        }

        if (mode === 'areas') {
          for (const [slug, data] of Object.entries(areaCentroids)) {
            const areaData = areas.find((a) => a.slug === slug);
            const lng =
              areaData?.map_center_lng ?? data.lngSum / data.count;
            const lat =
              areaData?.map_center_lat ?? data.latSum / data.count;

            labelPoints.push({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [lng, lat] },
              properties: { label: data.name },
            });
          }
        }

        if (cancelled) return;

        setGeojson({ type: 'FeatureCollection', features: enriched });
        setLabelGeojson({ type: 'FeatureCollection', features: labelPoints });
        setLoading(false);
      } catch (err) {
        console.error('Failed to load area GeoJSON:', err);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    mode,
    areaSlug,
    neighborhoodSlug,
    neighborhoods,
    areas,
    neighborhoodByGeoKey,
    getAreaSlug,
    areaById,
  ]);

  // -----------------------------------------------------------------------
  // Auto-fit bounds
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!geojson || !mapRef.current || center) return;

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    for (const feature of geojson.features) {
      const geom = feature.geometry as Polygon | MultiPolygon;
      const rings =
        geom.type === 'Polygon'
          ? geom.coordinates
          : geom.coordinates.flat();

      for (const ring of rings) {
        for (const [lng, lat] of ring) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      }
    }

    if (minLng !== Infinity) {
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 500 },
      );
    }
  }, [geojson, center]);

  // -----------------------------------------------------------------------
  // Interaction handlers
  // -----------------------------------------------------------------------
  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ['area-fill'],
    });

    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';
      const slug = features[0].properties?.slug as string | undefined;
      setHoveredSlug(slug ?? null);
    } else {
      map.getCanvas().style.cursor = '';
      setHoveredSlug(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = '';
    setHoveredSlug(null);
  }, []);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['area-fill'],
      });

      if (features.length === 0) {
        // Clicked map background — close the card
        setCardOpen(false);
        return;
      }

      const slug = features[0].properties?.slug as string | undefined;
      if (!slug) return;

      // Open info card
      setSelectedSlug(slug);
      setCardOpen(true);

      // Fire parent callbacks
      if (mode === 'areas') {
        onAreaClick?.(slug);
      } else if (mode === 'neighborhoods') {
        onNeighborhoodClick?.(slug);
      }
    },
    [mode, onAreaClick, onNeighborhoodClick],
  );

  const handleCardClose = useCallback(() => {
    setCardOpen(false);
  }, []);

  // -----------------------------------------------------------------------
  // Resolve card data from pre-fetched sets
  // -----------------------------------------------------------------------
  const activeAreaCard = selectedSlug ? areaCardData[selectedSlug] : undefined;
  const activeNeighborhoodCard = selectedSlug
    ? neighborhoodCardData[selectedSlug]
    : undefined;

  // -----------------------------------------------------------------------
  // Memoize fill layer (depends on hovered slug)
  // -----------------------------------------------------------------------
  const fillLayer = useMemo(() => makeFillLayer(hoveredSlug), [hoveredSlug]);

  // -----------------------------------------------------------------------
  // Initial view state
  // -----------------------------------------------------------------------
  const initialViewState = useMemo(
    () => ({
      longitude: center?.lng ?? ATLANTA_CENTER.lng,
      latitude: center?.lat ?? ATLANTA_CENTER.lat,
      zoom: zoom ?? ATLANTA_ZOOM,
    }),
    [center, zoom],
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        style={{ width: '100%', height: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        dragRotate={false}
        touchZoomRotate={true}
        touchPitch={false}
        interactiveLayerIds={['area-fill']}
      >
        {geojson && (
          <Source id="areas" type="geojson" data={geojson}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
          </Source>
        )}

        {showLabels && labelGeojson && (
          <Source id="labels" type="geojson" data={labelGeojson}>
            <Layer {...labelLayer} />
          </Source>
        )}
      </MapGL>

      {/* Info card — slides in from right (desktop) or bottom (mobile) */}
      {mode === 'areas' && activeAreaCard && (
        <MapInfoCard
          type="area"
          isOpen={cardOpen}
          onClose={handleCardClose}
          area={activeAreaCard.area}
          topNeighborhoods={activeAreaCard.topNeighborhoods}
          featuredBusiness={activeAreaCard.featuredBusiness}
        />
      )}

      {mode === 'neighborhoods' && activeNeighborhoodCard && (
        <MapInfoCard
          type="neighborhood"
          isOpen={cardOpen}
          onClose={handleCardClose}
          neighborhood={activeNeighborhoodCard.neighborhood}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="animate-pulse rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
            Loading map…
          </span>
        </div>
      )}
    </div>
  );
}
