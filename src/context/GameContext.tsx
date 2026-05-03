import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Team, CollectedCheckpoint } from '../types';

const STORAGE_KEY = 'suunnistus-game';

type Action =
  | { type: 'CREATE_TEAM'; team: Team }
  | { type: 'COLLECT_CHECKPOINT'; checkpointId: string }
  | { type: 'REACH_DESTINATION' }
  | { type: 'RESET' };

const initialState: GameState = {
  phase: 'create-team',
  team: null,
  collectedCheckpoints: [],
  startTime: null,
  endTime: null,
};

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
      return { ...state, team: action.team, phase: 'active', startTime: Date.now(), collectedCheckpoints: [] };
    case 'COLLECT_CHECKPOINT': {
      if (state.collectedCheckpoints.some((c) => c.checkpointId === action.checkpointId)) {
        return state;
      }
      const collected: CollectedCheckpoint = {
        checkpointId: action.checkpointId,
        collectedAt: Date.now(),
      };
      return { ...state, collectedCheckpoints: [...state.collectedCheckpoints, collected] };
    }
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
