import { describe, it, expect } from 'vitest';
import { getDistance, isWithinRadius, moveRandomDirection } from '../utils/geo';

describe('getDistance', () => {
  it('returns 0 for same point', () => {
    expect(getDistance(60.2, 24.8, 60.2, 24.8)).toBe(0);
  });

  it('computes roughly correct distance for known points', () => {
    // ~111km per degree of latitude
    const dist = getDistance(60.0, 24.0, 61.0, 24.0);
    expect(dist).toBeGreaterThan(110000);
    expect(dist).toBeLessThan(112000);
  });

  it('is symmetric', () => {
    const d1 = getDistance(60.22, 24.83, 60.23, 24.84);
    const d2 = getDistance(60.23, 24.84, 60.22, 24.83);
    expect(d1).toBeCloseTo(d2, 5);
  });
});

describe('isWithinRadius', () => {
  const checkpoint = { id: '1', name: 'Test', lat: 60.22, lng: 24.83, trivia: { question: '', options: [], correctIndex: 0 } };

  it('returns true when at the same position', () => {
    expect(isWithinRadius(checkpoint, { lat: 60.22, lng: 24.83 }, 30)).toBe(true);
  });

  it('returns false when far away', () => {
    expect(isWithinRadius(checkpoint, { lat: 60.23, lng: 24.83 }, 30)).toBe(false);
  });
});

describe('moveRandomDirection', () => {
  it('moves approximately the correct distance', () => {
    const from = { lat: 60.22, lng: 24.83 };
    const result = moveRandomDirection(from.lat, from.lng, 100);
    const dist = getDistance(from.lat, from.lng, result.lat, result.lng);
    expect(dist).toBeGreaterThan(90);
    expect(dist).toBeLessThan(110);
  });

  it('produces different results on multiple calls', () => {
    const results = Array.from({ length: 10 }, () =>
      moveRandomDirection(60.22, 24.83, 100)
    );
    const uniqueLats = new Set(results.map(r => r.lat.toFixed(8)));
    expect(uniqueLats.size).toBeGreaterThan(1);
  });
});
