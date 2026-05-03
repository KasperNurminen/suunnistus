import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Team, CollectedCheckpoint } from '../types';

const STORAGE_KEY = 'suunnistus-game';

type Action =
  | { type: 'CREATE_TEAM'; team: Team }
  | { type: 'ARRIVE_AT_CHECKPOINT'; checkpointId: string }
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER'; newLat: number; newLng: number }
  | { type: 'DISMISS_TRIVIA' }
  | { type: 'REACH_DESTINATION' }
  | { type: 'RESET' };

const initialState: GameState = {
  phase: 'create-team',
  team: null,
  collectedCheckpoints: [],
  startTime: null,
  endTime: null,
  movedCheckpoints: {},
  pendingCheckpointId: null,
};

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed };
    }
  } catch { /* ignore */ }
  return initialState;
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'CREATE_TEAM':
      return { ...state, team: action.team, phase: 'active', startTime: Date.now(), collectedCheckpoints: [], movedCheckpoints: {}, pendingCheckpointId: null };
    case 'ARRIVE_AT_CHECKPOINT':
      return { ...state, pendingCheckpointId: action.checkpointId };
    case 'CORRECT_ANSWER': {
      if (!state.pendingCheckpointId) return state;
      if (state.collectedCheckpoints.some((c) => c.checkpointId === state.pendingCheckpointId)) {
        return { ...state, pendingCheckpointId: null };
      }
      const collected: CollectedCheckpoint = {
        checkpointId: state.pendingCheckpointId,
        collectedAt: Date.now(),
      };
      return { ...state, collectedCheckpoints: [...state.collectedCheckpoints, collected], pendingCheckpointId: null };
    }
    case 'WRONG_ANSWER': {
      if (!state.pendingCheckpointId) return state;
      return {
        ...state,
        movedCheckpoints: {
          ...state.movedCheckpoints,
          [state.pendingCheckpointId]: { lat: action.newLat, lng: action.newLng },
        },
        pendingCheckpointId: null,
      };
    }
    case 'DISMISS_TRIVIA':
      return { ...state, pendingCheckpointId: null };
    case 'REACH_DESTINATION':
      return { ...state, phase: 'results', endTime: Date.now() };
    case 'RESET': {
      localStorage.removeItem(STORAGE_KEY);
      return initialState;
    }
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
