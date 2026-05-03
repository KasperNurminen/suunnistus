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

  // Store latest values in refs so the interval doesn't need to be recreated
  const playerPosRef = useRef(playerPosition);
  playerPosRef.current = playerPosition;
  const bloodlustedRef = useRef(isBloodlusted);
  const wasBloodlusted = useRef(false);

  // Track bloodlust transitions via ref
  useEffect(() => {
    if (isBloodlusted && !bloodlustedRef.current) {
      // Just entered bloodlust — snap to patrol position
      posRef.current = getBadgerPosition(Date.now());
      wasBloodlusted.current = true;
    }
    if (!isBloodlusted && bloodlustedRef.current) {
      wasBloodlusted.current = false;
    }
    bloodlustedRef.current = isBloodlusted;
  }, [isBloodlusted]);

  // Single stable interval — reads from refs, never recreated
  useEffect(() => {
    const interval = setInterval(() => {
      if (bloodlustedRef.current && playerPosRef.current) {
        const newPos = moveBadgerToward(posRef.current, playerPosRef.current, TICK_MS);
        posRef.current = newPos;
        setBadgerPosition(newPos);
      } else {
        const pos = getBadgerPosition(Date.now());
        posRef.current = pos;
        setBadgerPosition(pos);
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []); // stable — never recreated

  const teleportToPlayer = useCallback(() => {
    if (playerPosRef.current) {
      const offset = 0.00013; // ~15m
      const newPos = { lat: playerPosRef.current.lat + offset, lng: playerPosRef.current.lng };
      posRef.current = newPos;
      setBadgerPosition(newPos);
    }
  }, []);

  return { badgerPosition, teleportToPlayer };
}
