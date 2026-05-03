import { describe, it, expect } from 'vitest';
import { getBadgerPosition, moveBadgerToward } from '../data/badger';
import { getDistance } from '../utils/geo';

describe('getBadgerPosition', () => {
  it('returns a position with lat and lng', () => {
    const pos = getBadgerPosition(Date.now());
    expect(pos).toHaveProperty('lat');
    expect(pos).toHaveProperty('lng');
    expect(typeof pos.lat).toBe('number');
    expect(typeof pos.lng).toBe('number');
  });

  it('is deterministic — same timestamp gives same position', () => {
    const t = 1700000000000;
    const p1 = getBadgerPosition(t);
    const p2 = getBadgerPosition(t);
    expect(p1.lat).toBe(p2.lat);
    expect(p1.lng).toBe(p2.lng);
  });

  it('returns different positions at different times', () => {
    const p1 = getBadgerPosition(1700000000000);
    const p2 = getBadgerPosition(1700000060000); // 1 minute later
    const dist = getDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    expect(dist).toBeGreaterThan(0);
  });

  it('position stays within the forest area', () => {
    for (let i = 0; i < 100; i++) {
      const pos = getBadgerPosition(1700000000000 + i * 30000);
      expect(pos.lat).toBeGreaterThan(60.22);
      expect(pos.lat).toBeLessThan(60.23);
      expect(pos.lng).toBeGreaterThan(24.83);
      expect(pos.lng).toBeLessThan(24.85);
    }
  });
});

describe('moveBadgerToward', () => {
  it('moves toward the target', () => {
    const from = { lat: 60.22, lng: 24.83 };
    const target = { lat: 60.23, lng: 24.83 };
    const result = moveBadgerToward(from, target, 60000); // 1 minute

    // Should be closer to target than start
    const distBefore = getDistance(from.lat, from.lng, target.lat, target.lng);
    const distAfter = getDistance(result.lat, result.lng, target.lat, target.lng);
    expect(distAfter).toBeLessThan(distBefore);
  });

  it('does not overshoot the target', () => {
    const from = { lat: 60.22, lng: 24.83 };
    const target = { lat: 60.22001, lng: 24.83 }; // very close
    const result = moveBadgerToward(from, target, 600000); // 10 minutes — way more than needed

    expect(result.lat).toBe(target.lat);
    expect(result.lng).toBe(target.lng);
  });

  it('moves approximately 30m in 1 minute at default speed', () => {
    const from = { lat: 60.22, lng: 24.83 };
    const target = { lat: 60.23, lng: 24.83 }; // far enough
    const result = moveBadgerToward(from, target, 60000);
    const dist = getDistance(from.lat, from.lng, result.lat, result.lng);
    // 30m/min * 1.8 bloodlust multiplier = 54m
    expect(dist).toBeGreaterThan(45);
    expect(dist).toBeLessThan(60);
  });
});
