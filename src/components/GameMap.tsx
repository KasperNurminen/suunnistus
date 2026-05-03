import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Checkpoint } from '../types';

interface GameMapProps {
  checkpoints: Checkpoint[];
  collectedIds: Set<string>;
  position: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number; accuracy: number } | null;
}

export function GameMap({ checkpoints, collectedIds, position, destination }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const playerMarker = useRef<L.CircleMarker | null>(null);
  const accuracyCircle = useRef<L.Circle | null>(null);
  const checkpointMarkers = useRef<Map<string, L.CircleMarker>>(new Map());
  const destMarker = useRef<L.CircleMarker | null>(null);
  const destCircle = useRef<L.Circle | null>(null);

  // Initialize map
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

    // Add checkpoint markers
    for (const cp of checkpoints) {
      const marker = L.circleMarker([cp.lat, cp.lng], {
        radius: 12,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map);

      marker.bindTooltip(cp.name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });

      checkpointMarkers.current.set(cp.id, marker);
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      checkpointMarkers.current.clear();
    };
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
        marker.setStyle({
          color: '#4ade80',
          fillColor: '#4ade80',
          fillOpacity: 0.6,
        });
      }
    }
  }, [collectedIds]);

  // Update destination marker and accuracy circle
  useEffect(() => {
    if (!mapInstance.current) return;

    // Only show destination on map when accuracy is useful (< 1.5km)
    const showable = destination && destination.accuracy <= 1500;

    if (!showable) {
      destMarker.current?.remove();
      destCircle.current?.remove();
      destMarker.current = null;
      destCircle.current = null;
      return;
    }

    const latlng: L.LatLngExpression = [destination.lat, destination.lng];

    if (!destMarker.current) {
      destMarker.current = L.circleMarker(latlng, {
        radius: 10,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.8,
        weight: 3,
      }).addTo(mapInstance.current);

      destMarker.current.bindTooltip('Määränpää', {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });
    } else {
      destMarker.current.setLatLng(latlng);
    }

    if (destination.accuracy > 0) {
      if (!destCircle.current) {
        destCircle.current = L.circle(latlng, {
          radius: destination.accuracy,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '6 4',
        }).addTo(mapInstance.current);
      } else {
        destCircle.current.setLatLng(latlng);
        destCircle.current.setRadius(destination.accuracy);
      }
    } else {
      destCircle.current?.remove();
      destCircle.current = null;
    }
  }, [destination]);

  return <div ref={mapRef} className="game-map" />;
}
