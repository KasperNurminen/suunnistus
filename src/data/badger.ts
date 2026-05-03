import { getDistance } from '../utils/geo';

// Badger waypoints forming a loop through the checkpoint area in Mäkkylänmetsä
const WAYPOINTS = [
  { lat: 60.2235, lng: 24.8350 },
  { lat: 60.2240, lng: 24.8385 },
  { lat: 60.2235, lng: 24.8410 },
  { lat: 60.2248, lng: 24.8400 },
  { lat: 60.2258, lng: 24.8380 },
  { lat: 60.2255, lng: 24.8345 },
  { lat: 60.2248, lng: 24.8320 },
  { lat: 60.2240, lng: 24.8335 },
  // loops back to first waypoint
];

// Badger speed: ~30 meters per minute
const BADGER_SPEED_M_PER_MS = 30 / 60000;

export const BADGER_CATCH_RADIUS = 20; // meters
export const BADGER_IMMUNITY_MS = 5 * 60 * 1000; // 5 minutes

// Precompute segment distances and total cycle length
interface Segment {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  distance: number;
  cumDistance: number;
}

function buildSegments(): { segments: Segment[]; totalDistance: number } {
  const segments: Segment[] = [];
  let cumDistance = 0;

  for (let i = 0; i < WAYPOINTS.length; i++) {
    const from = WAYPOINTS[i];
    const to = WAYPOINTS[(i + 1) % WAYPOINTS.length];
    const distance = getDistance(from.lat, from.lng, to.lat, to.lng);
    segments.push({ from, to, distance, cumDistance });
    cumDistance += distance;
  }

  return { segments, totalDistance: cumDistance };
}

const { segments, totalDistance } = buildSegments();
const cycleDurationMs = totalDistance / BADGER_SPEED_M_PER_MS;

/**
 * Get the badger's position at a given timestamp.
 * Deterministic: same timestamp = same position across all clients.
 */
export function getBadgerPosition(timestampMs: number): { lat: number; lng: number } {
  // How far along the cycle are we?
  const timeInCycle = ((timestampMs % cycleDurationMs) + cycleDurationMs) % cycleDurationMs;
  const distanceAlongPath = timeInCycle * BADGER_SPEED_M_PER_MS;

  // Find which segment we're on
  for (const seg of segments) {
    if (distanceAlongPath <= seg.cumDistance + seg.distance) {
      const distIntoSegment = distanceAlongPath - seg.cumDistance;
      const fraction = distIntoSegment / seg.distance;
      return {
        lat: seg.from.lat + (seg.to.lat - seg.from.lat) * fraction,
        lng: seg.from.lng + (seg.to.lng - seg.from.lng) * fraction,
      };
    }
  }

  // Fallback (shouldn't reach here)
  return WAYPOINTS[0];
}
