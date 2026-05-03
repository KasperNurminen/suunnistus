import { describe, it, expect } from 'vitest';
import { getRevealedCoords } from '../components/CoordinateReveal';
import { getDistance } from '../utils/geo';
import { FINAL_DESTINATION } from '../data/checkpoints';

describe('getRevealedCoords', () => {
  it('returns null when not enough checkpoints', () => {
    expect(getRevealedCoords(0)).toBeNull();
    expect(getRevealedCoords(1)).toBeNull();
  });

  it('returns coordinates at minimum threshold', () => {
    const result = getRevealedCoords(2);
    expect(result).not.toBeNull();
    expect(result!.latStr).toBeDefined();
    expect(result!.lngStr).toBeDefined();
  });

  it('accuracy decreases as more checkpoints are collected', () => {
    const results = [2, 3, 4, 5, 6, 7].map(n => getRevealedCoords(n)!);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].accuracy).toBeLessThanOrEqual(results[i - 1].accuracy);
    }
  });

  it('revealed coordinate gets closer to target with more checkpoints', () => {
    const results = [2, 3, 4, 5, 6, 7].map(n => {
      const r = getRevealedCoords(n)!;
      return getDistance(r.lat, r.lng, FINAL_DESTINATION.lat, FINAL_DESTINATION.lng);
    });
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeLessThanOrEqual(results[i - 1] + 1); // +1m tolerance
    }
  });

  it('full precision at 8 checkpoints', () => {
    const result = getRevealedCoords(8)!;
    expect(result.accuracy).toBe(0);
    const dist = getDistance(result.lat, result.lng, FINAL_DESTINATION.lat, FINAL_DESTINATION.lng);
    expect(dist).toBeLessThan(1); // within 1 meter
  });

  it('each revealed coordinate is within its accuracy circle of the target', () => {
    for (let n = 2; n <= 8; n++) {
      const r = getRevealedCoords(n)!;
      const dist = getDistance(r.lat, r.lng, FINAL_DESTINATION.lat, FINAL_DESTINATION.lng);
      if (r.accuracy > 0) {
        expect(dist).toBeLessThan(r.accuracy);
      }
    }
  });

  it('successive circles are nested — each is within the previous', () => {
    for (let n = 3; n <= 8; n++) {
      const prev = getRevealedCoords(n - 1)!;
      const curr = getRevealedCoords(n)!;
      if (prev.accuracy > 0 && curr.accuracy > 0) {
        const distBetweenCenters = getDistance(prev.lat, prev.lng, curr.lat, curr.lng);
        // Current circle center + its radius should be within previous circle
        // Allow some tolerance since rounding can shift centers
        expect(distBetweenCenters + curr.accuracy).toBeLessThanOrEqual(prev.accuracy * 1.2 + 50);
      }
    }
  });
});
