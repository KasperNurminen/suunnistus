import { getDistance } from '../utils/geo';
import { CHECKPOINTS } from './checkpoints';

// Badger patrols from checkpoint to checkpoint
export const WAYPOINTS = CHECKPOINTS.map(cp => ({ lat: cp.lat, lng: cp.lng }));

// Badger speed: ~30 meters per minute
export const BADGER_SPEED_M_PER_MS = 30 / 60000;

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

export const BLOODLUST_THRESHOLD = 5;

/**
 * Move badger from `from` toward `target` by the distance it would travel in `deltaMs`.
 * Returns the new position, or `target` if it would overshoot.
 */
export function moveBadgerToward(
  from: { lat: number; lng: number },
  target: { lat: number; lng: number },
  deltaMs: number
): { lat: number; lng: number } {
  const dist = getDistance(from.lat, from.lng, target.lat, target.lng);
  const BLOODLUST_MULTIPLIER = 1.8;
  const moveDistance = deltaMs * BADGER_SPEED_M_PER_MS * BLOODLUST_MULTIPLIER;
  if (moveDistance >= dist) return { ...target };
  const fraction = moveDistance / dist;
  return {
    lat: from.lat + (target.lat - from.lat) * fraction,
    lng: from.lng + (target.lng - from.lng) * fraction,
  };
}
