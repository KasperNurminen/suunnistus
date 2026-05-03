import { useState, useEffect, useRef } from 'react';
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
        // If just entered bloodlust, snap to current patrol position first
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

  return { badgerPosition };
}
