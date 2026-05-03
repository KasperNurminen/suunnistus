import {
  FINAL_DESTINATION,
  MIN_CHECKPOINTS_FOR_REVEAL,
  REVEAL_STAGES,
} from '../data/checkpoints';
import { getDistance } from '../utils/geo';

interface CoordinateRevealProps {
  collectedCount: number;
}

function roundCoord(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function getRevealStage(collectedCount: number) {
  let stage = null;
  for (const s of REVEAL_STAGES) {
    if (collectedCount >= s.checkpoints) {
      stage = s;
    }
  }
  return stage;
}

export function getRevealedCoords(collectedCount: number) {
  const stage = getRevealStage(collectedCount);
  if (!stage) return null;

  const truncLat = parseFloat(roundCoord(FINAL_DESTINATION.lat, stage.latDigits));
  const truncLng = parseFloat(roundCoord(FINAL_DESTINATION.lng, stage.lngDigits));

  // Accuracy = distance from truncated point to actual target + buffer.
  // This guarantees the circle always contains the real destination.
  const distToTarget = getDistance(truncLat, truncLng, FINAL_DESTINATION.lat, FINAL_DESTINATION.lng);
  const isExact = stage.latDigits >= 8 && stage.lngDigits >= 8;
  // Add 30% buffer + 20m minimum to ensure nesting
  const accuracy = isExact ? 0 : Math.round(Math.max(distToTarget * 1.3 + 20, 30));

  return {
    lat: truncLat,
    lng: truncLng,
    accuracy,
    latStr: roundCoord(FINAL_DESTINATION.lat, stage.latDigits),
    lngStr: roundCoord(FINAL_DESTINATION.lng, stage.lngDigits),
  };
}

export function CoordinateReveal({ collectedCount }: CoordinateRevealProps) {
  const locked = collectedCount < MIN_CHECKPOINTS_FOR_REVEAL;
  const revealed = getRevealedCoords(collectedCount);

  if (locked) {
    const remaining = MIN_CHECKPOINTS_FOR_REVEAL - collectedCount;
    return (
      <div className="coord-reveal locked">
        <div className="coord-label">Määränpään koordinaatit</div>
        <div className="coord-value">
          <span className="coord-hidden">??.???</span>
          <span className="coord-separator">,</span>
          <span className="coord-hidden">??.???</span>
        </div>
        <div className="coord-hint">
          Kerää vielä {remaining} rasti{remaining > 1 ? 'a' : ''} paljastaaksesi koordinaatit
        </div>
      </div>
    );
  }

  return (
    <div className="coord-reveal">
      <div className="coord-label">Määränpään koordinaatit</div>
      <div className="coord-value">
        <span className="coord-number">{revealed!.latStr}</span>
        <span className="coord-separator">,</span>
        <span className="coord-number">{revealed!.lngStr}</span>
      </div>
      <div className="coord-accuracy">
        {revealed!.accuracy > 0
          ? `Tarkkuus: ~${revealed!.accuracy >= 1000 ? `${(revealed!.accuracy / 1000).toFixed(1)}km` : `${revealed!.accuracy}m`}`
          : 'Tarkka sijainti'}
        {' '}
        <span className="coord-hint-more">
          — kerää lisää rasteja tarkentaaksesi
        </span>
      </div>
    </div>
  );
}
