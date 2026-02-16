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
import { MousePointerClick } from 'lucide-react';
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
  areaCardData?: Record<string, AreaCardData>;
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
  hoveredSlug: string | null,
  selectedSlug: string | null,
): Omit<FillLayerSpecification, 'source'> & { id: string } {
  return {
    id: 'area-fill',
    type: 'fill' as const,
    paint: {
      'fill-color': '#c4a24d',
      'fill-opacity': [
        'case',
        ['==', ['get', 'slug'], selectedSlug ?? ''],
        0.80,
        ['==', ['get', 'slug'], hoveredSlug ?? ''],
        0.70,
        0.55,
      ] as unknown as number,
    },
  };
}

const lineLayer: Omit<LineLayerSpecification, 'source'> & { id: string } = {
  id: 'area-line',
  type: 'line' as const,
  paint: {
    'line-color': 'rgba(255,248,230,0.45)',
    'line-width': 1.5,
    'line-opacity': 1,
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
// Instruction Panel (left overlay when no area is selected)
// ---------------------------------------------------------------------------

function InstructionPanel({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute top-0 left-0 bottom-0 z-[5] flex w-[380px] max-md:w-full items-center pointer-events-none transition-[opacity,transform] duration-[350ms] ease-in-out"
      style={{
        background:
          'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0) 100%)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-20px)',
      }}
    >
      <div className="px-12 max-md:px-8">
        <span className="text-[#c1121f] text-[10px] font-semibold uppercase tracking-[0.15em]">
          Explore Atlanta
        </span>
        <h2 className="font-display text-4xl font-semibold italic text-white mt-3 leading-tight">
          Discover Your Neighborhood
        </h2>
        <p className="mt-4 text-sm text-white/50 leading-[1.7]">
          Tap an area on the map to uncover the neighborhoods, businesses, and
          stories that define Atlanta&rsquo;s most vibrant communities.
        </p>
        <div className="mt-6 flex items-center gap-2">
          <MousePointerClick
            size={16}
            className="text-[#fee198] animate-[pulse-icon_2s_ease-in-out_infinite]"
          />
          <span className="text-[#fee198] text-xs font-medium">
            Select an area to begin
          </span>
        </div>
      </div>
    </div>
  );
}

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

  // Build lookup maps
  const areaById = useMemo(() => {
    const lookup: Record<string, AreaEntry> = {};
    for (const a of areas) lookup[a.id] = a;
    return lookup;
  }, [areas]);

  const neighborhoodByGeoKey = useMemo(() => {
    const lookup: Record<string, NeighborhoodEntry> = {};
    for (const n of neighborhoods) {
      // Index by geojson_key first (takes precedence)
      if (n.geojson_key) lookup[n.geojson_key] = n;
      // Also index by name as fallback when geojson_key is not populated
      if (!lookup[n.name]) lookup[n.name] = n;
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

        if (mode === 'areas') {
          // ----- Areas mode: merge neighborhood polygons into one MultiPolygon per area -----
          const areaGroups: Record<
            string,
            { coords: number[][][] []; areaName: string; color: string }
          > = {};

          for (const feature of raw.features) {
            const name = (feature.properties as Record<string, unknown>)
              ?.NAME as string | undefined;
            if (!name) continue;

            const nbr = neighborhoodByGeoKey[name];
            const nAreaSlug = nbr ? getAreaSlug(nbr) : '';
            const groupKey = nAreaSlug || '__unmatched__';
            const color = AREA_COLORS[nAreaSlug] ?? DEFAULT_AREA_COLOR;
            const area = nbr ? areaById[nbr.area_id] : undefined;

            const geom = feature.geometry as Polygon | MultiPolygon;
            const polygonCoords =
              geom.type === 'Polygon'
                ? [geom.coordinates]
                : geom.coordinates;

            const existing = areaGroups[groupKey];
            if (existing) {
              existing.coords.push(...polygonCoords);
            } else {
              areaGroups[groupKey] = {
                coords: [...polygonCoords],
                areaName: area?.name ?? nAreaSlug,
                color,
              };
            }
          }

          // Emit one merged MultiPolygon feature per area
          for (const [slug, group] of Object.entries(areaGroups)) {
            enriched.push({
              type: 'Feature',
              geometry: {
                type: 'MultiPolygon',
                coordinates: group.coords,
              },
              properties: {
                NAME: group.areaName,
                areaSlug: slug,
                areaColor: group.color,
                slug,
                label: group.areaName,
              },
            });

            // Label point — prefer DB-stored map center, fall back to centroid
            const areaData = areas.find((a) => a.slug === slug);
            if (areaData) {
              labelPoints.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [areaData.map_center_lng, areaData.map_center_lat],
                },
                properties: { label: group.areaName },
              });
            }
          }
        } else {
          // ----- Neighborhoods / single-neighborhood mode: one feature per neighborhood -----
          for (const feature of raw.features) {
            const name = (feature.properties as Record<string, unknown>)
              ?.NAME as string | undefined;
            if (!name) continue;

            const nbr = neighborhoodByGeoKey[name];
            if (!nbr) continue;

            const nAreaSlug = getAreaSlug(nbr);
            const color = AREA_COLORS[nAreaSlug] ?? DEFAULT_AREA_COLOR;

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
                slug: nbr.slug,
                label: nbr.name,
              },
            });

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
        setSelectedSlug(null);
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
    setSelectedSlug(null);
  }, []);

  // -----------------------------------------------------------------------
  // Resolve card data from pre-fetched sets
  // -----------------------------------------------------------------------
  const activeAreaCard = selectedSlug ? areaCardData[selectedSlug] : undefined;
  const activeNeighborhoodCard = selectedSlug
    ? neighborhoodCardData[selectedSlug]
    : undefined;

  // -----------------------------------------------------------------------
  // Memoize fill layer (depends on hovered + selected slug)
  // -----------------------------------------------------------------------
  const fillLayer = useMemo(
    () => makeFillLayer(hoveredSlug, cardOpen ? selectedSlug : null),
    [hoveredSlug, selectedSlug, cardOpen],
  );

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
      {/* Keyframe for pulsing icon animation */}
      <style>{`
        @keyframes pulse-icon {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

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

      {/* Instruction panel — visible when no card is open (areas mode only) */}
      {mode === 'areas' && <InstructionPanel visible={!cardOpen} />}

      {/* Info card — slides in from left (desktop) or bottom (mobile) */}
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
