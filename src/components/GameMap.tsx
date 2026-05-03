import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Checkpoint } from '../types';

interface GameMapProps {
  checkpoints: Checkpoint[];
  collectedIds: Set<string>;
  position: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number; accuracy: number } | null;
  badgerPosition: { lat: number; lng: number };
  isBloodlusted: boolean;
}

const BADGER_ICON_NORMAL = '<div class="badger-icon">🦡</div>';
const BADGER_ICON_ANGRY = '<div class="badger-icon badger-angry">🦡</div>';

export function GameMap({ checkpoints, collectedIds, position, destination, badgerPosition, isBloodlusted }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const playerMarker = useRef<L.CircleMarker | null>(null);
  const accuracyCircle = useRef<L.Circle | null>(null);
  const checkpointMarkers = useRef<Map<string, L.CircleMarker>>(new Map());
  const destMarker = useRef<L.CircleMarker | null>(null);
  const destCircle = useRef<L.Circle | null>(null);
  const badgerMarkerRef = useRef<L.Marker | null>(null);
  const badgerBloodlusted = useRef(false);

  // Initialize map (once)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center: L.LatLngExpression = [60.2245, 24.8360];
    const map = L.map(mapRef.current, {
      center,
      zoom: 16,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      checkpointMarkers.current.clear();
      badgerMarkerRef.current = null;
      playerMarker.current = null;
      accuracyCircle.current = null;
    };
  }, []);

  // Update checkpoint markers
  useEffect(() => {
    if (!mapInstance.current) return;

    for (const [, marker] of checkpointMarkers.current) {
      marker.remove();
    }
    checkpointMarkers.current.clear();

    for (const cp of checkpoints) {
      const marker = L.circleMarker([cp.lat, cp.lng], {
        radius: 12,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(mapInstance.current);

      marker.bindTooltip(cp.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });

      checkpointMarkers.current.set(cp.id, marker);
    }
  }, [checkpoints]);

  // Update player position
  useEffect(() => {
    if (!mapInstance.current || !position) return;

    const latlng: L.LatLngExpression = [position.lat, position.lng];

    if (!playerMarker.current) {
      playerMarker.current = L.circleMarker(latlng, {
        radius: 8,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 3,
      }).addTo(mapInstance.current);

      accuracyCircle.current = L.circle(latlng, {
        radius: 15,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(mapInstance.current);

      mapInstance.current.setView(latlng, 16);
    } else {
      playerMarker.current.setLatLng(latlng);
      accuracyCircle.current?.setLatLng(latlng);
    }
  }, [position]);

  // Update collected checkpoint styles
  useEffect(() => {
    for (const [id, marker] of checkpointMarkers.current) {
      if (collectedIds.has(id)) {
        marker.setStyle({ color: '#4ade80', fillColor: '#4ade80', fillOpacity: 0.6 });
      } else {
        marker.setStyle({ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.3 });
      }
    }
  }, [collectedIds]);

  // Update badger marker
  useEffect(() => {
    if (!mapInstance.current) return;

    const latlng: L.LatLngExpression = [badgerPosition.lat, badgerPosition.lng];

    if (!badgerMarkerRef.current) {
      const icon = L.divIcon({
        html: isBloodlusted ? BADGER_ICON_ANGRY : BADGER_ICON_NORMAL,
        className: 'badger-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      badgerMarkerRef.current = L.marker(latlng, { icon, zIndexOffset: 1000 }).addTo(mapInstance.current);
      badgerBloodlusted.current = isBloodlusted;
    } else {
      badgerMarkerRef.current.setLatLng(latlng);
      // Update icon if bloodlust state changed
      if (badgerBloodlusted.current !== isBloodlusted) {
        const icon = L.divIcon({
          html: isBloodlusted ? BADGER_ICON_ANGRY : BADGER_ICON_NORMAL,
          className: 'badger-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        badgerMarkerRef.current.setIcon(icon);
        badgerBloodlusted.current = isBloodlusted;
      }
    }
  }, [badgerPosition, isBloodlusted]);

  // Update destination marker and accuracy circle
  useEffect(() => {
    if (!mapInstance.current) return;

    if (!destination) {
      destMarker.current?.remove();
      destCircle.current?.remove();
      destMarker.current = null;
      destCircle.current = null;
      return;
    }

    const map = mapInstance.current;
    const latlng: L.LatLngExpression = [destination.lat, destination.lng];

    // Always remove and recreate to avoid stale marker issues
    destMarker.current?.remove();
    destCircle.current?.remove();

    destMarker.current = L.circleMarker(latlng, {
      radius: 10,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.8,
      weight: 3,
    }).addTo(map);

    destMarker.current.bindTooltip('Määränpää', {
      permanent: false,
      direction: 'top',
      offset: [0, -10],
    });

    if (destination.accuracy > 0) {
      destCircle.current = L.circle(latlng, {
        radius: destination.accuracy,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map);
    } else {
      destCircle.current = null;
    }
  }, [destination]);

  return <div ref={mapRef} className="game-map" />;
}
