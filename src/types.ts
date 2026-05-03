export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  trivia: TriviaQuestion;
}

export interface Team {
  name: string;
  members: string[];
}

export interface CollectedCheckpoint {
  checkpointId: string;
  collectedAt: number; // timestamp
}

export interface GameState {
  phase: 'create-team' | 'active' | 'results';
  team: Team | null;
  collectedCheckpoints: CollectedCheckpoint[];
  startTime: number | null;
  endTime: number | null;
  movedCheckpoints: Record<string, { lat: number; lng: number }>;
  pendingCheckpointId: string | null;
  badgerImmunityUntil: number | null;
}
