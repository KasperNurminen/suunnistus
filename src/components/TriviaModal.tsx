import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CHECKPOINTS } from '../data/checkpoints';
import { moveRandomDirection } from '../utils/geo';

export function TriviaModal() {
  const { state, dispatch } = useGame();
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  if (!state.pendingCheckpointId) return null;

  const checkpoint = CHECKPOINTS.find((cp) => cp.id === state.pendingCheckpointId);
  if (!checkpoint) return null;

  const { trivia } = checkpoint;

  const handleAnswer = (index: number) => {
    if (feedback) return; // prevent double tap

    if (index === trivia.correctIndex) {
      setFeedback('correct');
      setTimeout(() => {
        dispatch({ type: 'CORRECT_ANSWER' });
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback('wrong');
      const currentLat = state.movedCheckpoints[checkpoint.id]?.lat ?? checkpoint.lat;
      const currentLng = state.movedCheckpoints[checkpoint.id]?.lng ?? checkpoint.lng;
      const newPos = moveRandomDirection(currentLat, currentLng, 100);
      setTimeout(() => {
        dispatch({ type: 'WRONG_ANSWER', newLat: newPos.lat, newLng: newPos.lng });
        setFeedback(null);
      }, 2500);
    }
  };

  return (
    <div className="trivia-overlay">
      <div className="trivia-modal">
        <div className="trivia-header">Muistinpalanen — {checkpoint.name}</div>
        <p className="trivia-question">{trivia.question}</p>
        <div className="trivia-options">
          {trivia.options.map((option, i) => (
            <button
              key={i}
              className={`trivia-option ${
                feedback && i === trivia.correctIndex ? 'correct' : ''
              } ${
                feedback === 'wrong' && i !== trivia.correctIndex ? 'dimmed' : ''
              }`}
              onClick={() => handleAnswer(i)}
              disabled={feedback !== null}
            >
              {option}
            </button>
          ))}
        </div>
        {feedback === 'correct' && (
          <div className="trivia-feedback correct">Muisto palautui!</div>
        )}
        {feedback === 'wrong' && (
          <div className="trivia-feedback wrong">
            Väärin! Muistikuva hämärtyi ja rasti siirtyi 100m uuteen paikkaan...
          </div>
        )}
      </div>
    </div>
  );
}
