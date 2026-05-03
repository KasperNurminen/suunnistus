import { Checkpoint } from '../types';

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function moveRandomDirection(
  lat: number,
  lng: number,
  distanceMeters: number
): { lat: number; lng: number } {
  const angle = Math.random() * 2 * Math.PI;
  const dLat = (distanceMeters / EARTH_RADIUS_M) * (180 / Math.PI);
  const dLng = (distanceMeters / (EARTH_RADIUS_M * Math.cos(toRad(lat)))) * (180 / Math.PI);
  return {
    lat: lat + dLat * Math.cos(angle),
    lng: lng + dLng * Math.sin(angle),
  };
}

export function isWithinRadius(
  checkpoint: Checkpoint,
  position: { lat: number; lng: number },
  radius: number
): boolean {
  return getDistance(checkpoint.lat, checkpoint.lng, position.lat, position.lng) <= radius;
}
