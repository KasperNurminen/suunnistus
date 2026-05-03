import { useEffect, useState, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { CHECKPOINTS, COLLECT_RADIUS_METERS, FINAL_DESTINATION, DESTINATION_RADIUS, MIN_CHECKPOINTS_FOR_REVEAL } from '../data/checkpoints';
import { isWithinRadius, getDistance } from '../utils/geo';
import { GameMap } from './GameMap';
import { CoordinateReveal, getRevealedCoords } from './CoordinateReveal';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ActiveGame() {
  const { state, dispatch } = useGame();
  const { position, error } = useGeolocation();
  const [elapsed, setElapsed] = useState(0);
  const [lastCollected, setLastCollected] = useState<string | null>(null);
  const lastCollectedTimer = useRef<ReturnType<typeof setTimeout>>();

  // Update timer every second
  useEffect(() => {
    if (!state.startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - state.startTime!);
    }, 1000);
    return () => clearInterval(interval);
  }, [state.startTime]);

  // Check proximity to checkpoints
  const checkProximity = useCallback(() => {
    if (!position) return;
    const collectedIds = new Set(state.collectedCheckpoints.map((c) => c.checkpointId));

    for (const checkpoint of CHECKPOINTS) {
      if (collectedIds.has(checkpoint.id)) continue;
      if (isWithinRadius(checkpoint, position, COLLECT_RADIUS_METERS)) {
        dispatch({ type: 'COLLECT_CHECKPOINT', checkpointId: checkpoint.id });
        setLastCollected(checkpoint.name);
        clearTimeout(lastCollectedTimer.current);
        lastCollectedTimer.current = setTimeout(() => setLastCollected(null), 3000);
      }
    }
  }, [position, state.collectedCheckpoints, dispatch]);

  useEffect(() => {
    checkProximity();
  }, [checkProximity]);

  // Check if player reached final destination
  useEffect(() => {
    if (!position) return;
    if (state.collectedCheckpoints.length < MIN_CHECKPOINTS_FOR_REVEAL) return;
    const dist = getDistance(FINAL_DESTINATION.lat, FINAL_DESTINATION.lng, position.lat, position.lng);
    if (dist <= DESTINATION_RADIUS) {
      dispatch({ type: 'REACH_DESTINATION' });
    }
  }, [position, state.collectedCheckpoints.length, dispatch]);

  const collectedIds = new Set(state.collectedCheckpoints.map((c) => c.checkpointId));
  const revealedCoords = getRevealedCoords(state.collectedCheckpoints.length);

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

      <CoordinateReveal collectedCount={state.collectedCheckpoints.length} />

      {error && <div className="error">GPS-virhe: {error}</div>}

      <GameMap
        checkpoints={CHECKPOINTS}
        collectedIds={collectedIds}
        position={position}
        destination={revealedCoords ? { lat: revealedCoords.lat, lng: revealedCoords.lng, accuracy: revealedCoords.accuracy } : null}
      />

      <ul className="checkpoint-list">
        {CHECKPOINTS.map((cp) => {
          const collected = collectedIds.has(cp.id);
          const distance =
            position ? getDistance(cp.lat, cp.lng, position.lat, position.lng) : null;
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
              {!collected && (
                <button
                  className="btn-dev"
                  onClick={() => dispatch({ type: 'COLLECT_CHECKPOINT', checkpointId: cp.id })}
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
    </div>
  );
}
