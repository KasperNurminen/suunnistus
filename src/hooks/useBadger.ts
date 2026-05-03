import { useState, useEffect } from 'react';
import { getBadgerPosition } from '../data/badger';

export function useBadger() {
  const [badgerPosition, setBadgerPosition] = useState(() => getBadgerPosition(Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgerPosition(getBadgerPosition(Date.now()));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { badgerPosition };
}
