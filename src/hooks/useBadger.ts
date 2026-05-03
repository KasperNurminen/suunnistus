import { useState, useEffect, useRef, useCallback } from 'react';
import { getBadgerPosition, moveBadgerToward } from '../data/badger';

const TICK_MS = 2000;

interface UseBadgerOptions {
  playerPosition: { lat: number; lng: number } | null;
  isBloodlusted: boolean;
}

export function useBadger({ playerPosition, isBloodlusted }: UseBadgerOptions) {
  const [badgerPosition, setBadgerPosition] = useState(() => getBadgerPosition(Date.now()));
  const posRef = useRef(badgerPosition);
  posRef.current = badgerPosition;

  const wasBloodlusted = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isBloodlusted && playerPosition) {
        if (!wasBloodlusted.current) {
          posRef.current = getBadgerPosition(Date.now());
          wasBloodlusted.current = true;
        }
        const newPos = moveBadgerToward(posRef.current, playerPosition, TICK_MS);
        posRef.current = newPos;
        setBadgerPosition(newPos);
      } else {
        wasBloodlusted.current = false;
        const pos = getBadgerPosition(Date.now());
        posRef.current = pos;
        setBadgerPosition(pos);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isBloodlusted, playerPosition]);

  const teleportToPlayer = useCallback(() => {
    if (playerPosition) {
      // Place badger 15m from player (within catch radius)
      const offset = 0.00013; // ~15m
      const newPos = { lat: playerPosition.lat + offset, lng: playerPosition.lng };
      posRef.current = newPos;
      setBadgerPosition(newPos);
    }
  }, [playerPosition]);

  return { badgerPosition, teleportToPlayer };
}
