import { useGame } from '../context/GameContext';
import { CHECKPOINTS, FINAL_DESTINATION } from '../data/checkpoints';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function Results() {
  const { state, dispatch } = useGame();
  const totalTime = (state.endTime ?? 0) - (state.startTime ?? 0);
  const checkpointMap = new Map(CHECKPOINTS.map((cp) => [cp.id, cp]));

  return (
    <div className="screen">
      <h1>Perillä!</h1>
      <div className="total-time">{formatTime(totalTime)}</div>
      <div className="team-badge">{state.team?.name}</div>
      <p className="members">{state.team?.members.join(', ')}</p>

      <div className="answer-reveal">
        Määränpää: <strong>{FINAL_DESTINATION.lat.toFixed(6)}, {FINAL_DESTINATION.lng.toFixed(6)}</strong>
      </div>

      <h2>Rastit ({state.collectedCheckpoints.length} / {CHECKPOINTS.length})</h2>
      <ol className="results-list">
        {state.collectedCheckpoints.map((cc) => {
          const cp = checkpointMap.get(cc.checkpointId);
          const splitTime = cc.collectedAt - (state.startTime ?? 0);
          return (
            <li key={cc.checkpointId} className="result-item">
              <span className="result-name">{cp?.name ?? cc.checkpointId}</span>
              <span className="result-split">{formatTime(splitTime)}</span>
            </li>
          );
        })}
      </ol>

      <button className="btn-primary" onClick={() => dispatch({ type: 'RESET' })}>
        Pelaa uudelleen
      </button>
    </div>
  );
}
