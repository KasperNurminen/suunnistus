import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useBadger } from '../hooks/useBadger';
import { CHECKPOINTS, COLLECT_RADIUS_METERS, FINAL_DESTINATION, DESTINATION_RADIUS, MIN_CHECKPOINTS_FOR_REVEAL } from '../data/checkpoints';
import { BADGER_CATCH_RADIUS, BLOODLUST_THRESHOLD } from '../data/badger';
import { getDistance } from '../utils/geo';
import { GameMap } from './GameMap';
import { CoordinateReveal, getRevealedCoords } from './CoordinateReveal';
import { TriviaModal } from './TriviaModal';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ActiveGame() {
  const { state, dispatch } = useGame();
  const { position, error } = useGeolocation();
  const immuneRemaining = state.badgerImmunityUntil ? Math.max(0, state.badgerImmunityUntil - Date.now()) : 0;
  const isImmune = immuneRemaining > 0;
  const isBloodlusted = state.collectedCheckpoints.length >= BLOODLUST_THRESHOLD && !isImmune;
  const { badgerPosition } = useBadger({ playerPosition: position, isBloodlusted });
  const [elapsed, setElapsed] = useState(0);
  const [lastCollected, setLastCollected] = useState<string | null>(null);
  const lastCollectedTimer = useRef<ReturnType<typeof setTimeout>>();
  const [badgerCaught, setBadgerCaught] = useState(false);
  const badgerCaughtTimer = useRef<ReturnType<typeof setTimeout>>();

  // Get effective checkpoint position (original or moved)
  const getCheckpointPos = useCallback((cp: typeof CHECKPOINTS[0]) => {
    const moved = state.movedCheckpoints[cp.id];
    return moved ?? { lat: cp.lat, lng: cp.lng };
  }, [state.movedCheckpoints]);

  // Update timer every second
  useEffect(() => {
    if (!state.startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - state.startTime!);
    }, 1000);
    return () => clearInterval(interval);
  }, [state.startTime]);

  // Check proximity to checkpoints — trigger trivia instead of auto-collect
  const checkProximity = useCallback(() => {
    if (!position || state.pendingCheckpointId) return;
    const collectedIds = new Set(state.collectedCheckpoints.map((c) => c.checkpointId));

    for (const checkpoint of CHECKPOINTS) {
      if (collectedIds.has(checkpoint.id)) continue;
      const pos = getCheckpointPos(checkpoint);
      const dist = getDistance(pos.lat, pos.lng, position.lat, position.lng);
      if (dist <= COLLECT_RADIUS_METERS) {
        // Vibrate on arrival
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        dispatch({ type: 'ARRIVE_AT_CHECKPOINT', checkpointId: checkpoint.id });
        break;
      }
    }
  }, [position, state.collectedCheckpoints, state.pendingCheckpointId, getCheckpointPos, dispatch]);

  useEffect(() => {
    checkProximity();
  }, [checkProximity]);

  // Check badger proximity
  useEffect(() => {
    if (!position || !badgerPosition) return;
    if (state.collectedCheckpoints.length === 0) return;
    if (state.pendingCheckpointId) return; // don't catch during trivia

    // Check immunity
    const now = Date.now();
    if (state.badgerImmunityUntil && now < state.badgerImmunityUntil) return;

    const dist = getDistance(badgerPosition.lat, badgerPosition.lng, position.lat, position.lng);
    if (dist <= BADGER_CATCH_RADIUS) {
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
      dispatch({ type: 'CAUGHT_BY_BADGER' });
      setBadgerCaught(true);
      clearTimeout(badgerCaughtTimer.current);
      badgerCaughtTimer.current = setTimeout(() => setBadgerCaught(false), 4000);
    }
  }, [position, badgerPosition, state.collectedCheckpoints.length, state.badgerImmunityUntil, state.pendingCheckpointId, dispatch]);

  // Watch for newly collected checkpoints to show toast
  const prevCollectedCount = useRef(state.collectedCheckpoints.length);
  useEffect(() => {
    if (state.collectedCheckpoints.length > prevCollectedCount.current) {
      const latest = state.collectedCheckpoints[state.collectedCheckpoints.length - 1];
      const cp = CHECKPOINTS.find((c) => c.id === latest.checkpointId);
      if (cp) {
        setLastCollected(cp.name);
        clearTimeout(lastCollectedTimer.current);
        lastCollectedTimer.current = setTimeout(() => setLastCollected(null), 3000);
      }
    }
    prevCollectedCount.current = state.collectedCheckpoints.length;
  }, [state.collectedCheckpoints]);

  // Check if player reached final destination
  useEffect(() => {
    if (!position) return;
    if (state.collectedCheckpoints.length < MIN_CHECKPOINTS_FOR_REVEAL) return;
    const dist = getDistance(FINAL_DESTINATION.lat, FINAL_DESTINATION.lng, position.lat, position.lng);
    if (dist <= DESTINATION_RADIUS) {
      dispatch({ type: 'REACH_DESTINATION' });
    }
  }, [position, state.collectedCheckpoints.length, dispatch]);

  const collectedIds = useMemo(
    () => new Set(state.collectedCheckpoints.map((c) => c.checkpointId)),
    [state.collectedCheckpoints]
  );
  const revealedCoords = useMemo(
    () => getRevealedCoords(state.collectedCheckpoints.length),
    [state.collectedCheckpoints.length]
  );
  const destination = useMemo(
    () => revealedCoords ? { lat: revealedCoords.lat, lng: revealedCoords.lng, accuracy: revealedCoords.accuracy } : null,
    [revealedCoords]
  );

  // Build effective checkpoint list with moved positions for map
  const effectiveCheckpoints = useMemo(() =>
    CHECKPOINTS.map((cp) => ({
      ...cp,
      ...getCheckpointPos(cp),
    })),
    [getCheckpointPos]
  );

  return (
    <div className="screen">
      <div className="timer">{formatTime(elapsed)}</div>
      <div className="team-badge">{state.team?.name}</div>

      <div className="progress">
        {state.collectedCheckpoints.length} / {CHECKPOINTS.length} rastia
      </div>

      {lastCollected && (
        <div className="collected-toast">Kerätty: {lastCollected}!</div>
      )}

      {badgerCaught && (
        <div className="badger-toast">Mäyrä sai sinut kiinni! Menetit yhden muiston.</div>
      )}

      {isBloodlusted && !badgerCaught && (
        <div className="bloodlust-warning">Mäyrä on raivoissaan ja jahtaa sinua!</div>
      )}

      {isImmune && !badgerCaught && (
        <div className="immunity-badge">Mäyräsuoja aktiivinen ({Math.ceil(immuneRemaining / 1000)}s)</div>
      )}

      <CoordinateReveal collectedCount={state.collectedCheckpoints.length} />

      {error && <div className="error">GPS-virhe: {error}</div>}

      <GameMap
        checkpoints={effectiveCheckpoints}
        collectedIds={collectedIds}
        position={position}
        destination={destination}
        badgerPosition={badgerPosition}
        isBloodlusted={isBloodlusted}
      />

      <ul className="checkpoint-list">
        {CHECKPOINTS.map((cp) => {
          const collected = collectedIds.has(cp.id);
          const pos = getCheckpointPos(cp);
          const distance =
            position ? getDistance(pos.lat, pos.lng, position.lat, position.lng) : null;
          return (
            <li key={cp.id} className={`checkpoint-item ${collected ? 'collected' : ''}`}>
              <span className="checkpoint-status">{collected ? '\u2713' : '\u25CB'}</span>
              <span className="checkpoint-name">{cp.name}</span>
              {!collected && distance !== null && (
                <span className="checkpoint-distance">
                  {distance < 1000
                    ? `${Math.round(distance)}m`
                    : `${(distance / 1000).toFixed(1)}km`}
                </span>
              )}
              {/* DEV: temporary manual collect button */}
              {import.meta.env.DEV && !collected && (
                <button
                  className="btn-dev"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                    dispatch({ type: 'ARRIVE_AT_CHECKPOINT', checkpointId: cp.id });
                  }}
                >
                  DEV
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <button
        className="btn-reset"
        onClick={() => {
          if (confirm('Haluatko varmasti aloittaa alusta?')) {
            dispatch({ type: 'RESET' });
          }
        }}
      >
        Aloita alusta
      </button>

      <TriviaModal />
    </div>
  );
}
