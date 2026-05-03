import { useState, useEffect, useRef, useCallback } from 'react';
import { getBadgerPosition, moveBadgerToward } from '../data/badger';

const TICK_MS = 2000;

interface UseBadgerOptions {
  playerPosition: { lat: number; lng: number } | null;
  isBloodlusted: boolean;
  timeMultiplier?: number;
}

export function useBadger({ playerPosition, isBloodlusted, timeMultiplier = 1 }: UseBadgerOptions) {
  const [badgerPosition, setBadgerPosition] = useState(() => getBadgerPosition(Date.now()));
  const posRef = useRef(badgerPosition);
  posRef.current = badgerPosition;

  const playerPosRef = useRef(playerPosition);
  playerPosRef.current = playerPosition;
  const bloodlustedRef = useRef(isBloodlusted);
  const wasBloodlusted = useRef(false);
  const timeMultiplierRef = useRef(timeMultiplier);
  timeMultiplierRef.current = timeMultiplier;

  useEffect(() => {
    if (isBloodlusted && !bloodlustedRef.current) {
      posRef.current = getBadgerPosition(Date.now());
      wasBloodlusted.current = true;
    }
    if (!isBloodlusted && bloodlustedRef.current) {
      wasBloodlusted.current = false;
    }
    bloodlustedRef.current = isBloodlusted;
  }, [isBloodlusted]);

  useEffect(() => {
    const interval = setInterval(() => {
      const mult = timeMultiplierRef.current;
      if (bloodlustedRef.current && playerPosRef.current) {
        const newPos = moveBadgerToward(posRef.current, playerPosRef.current, TICK_MS * mult);
        posRef.current = newPos;
        setBadgerPosition(newPos);
      } else {
        // Multiply time offset to speed up patrol
        const now = Date.now();
        const sped = Math.floor(now * mult);
        const pos = getBadgerPosition(sped);
        posRef.current = pos;
        setBadgerPosition(pos);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const teleportToPlayer = useCallback(() => {
    if (playerPosRef.current) {
      const offset = 0.00013;
      const newPos = { lat: playerPosRef.current.lat + offset, lng: playerPosRef.current.lng };
      posRef.current = newPos;
      setBadgerPosition(newPos);
    }
  }, []);

  return { badgerPosition, teleportToPlayer };
}
