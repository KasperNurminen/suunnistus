import { Checkpoint } from '../types';

// 8 checkpoints in Mäkkylänmetsä forest, Espoo
export const CHECKPOINTS: Checkpoint[] = [
  { id: '1', name: 'Rasti 1', lat: 60.22342231225804, lng: 24.84101685311893 },
  { id: '2', name: 'Rasti 2', lat: 60.22335247608895, lng: 24.838351303799655 },
  { id: '3', name: 'Rasti 3', lat: 60.222468951130715, lng: 24.839360567342702 },
  { id: '4', name: 'Rasti 4', lat: 60.225692281036366, lng: 24.83296139902883 },
  { id: '5', name: 'Rasti 5', lat: 60.22425405648699, lng: 24.8324789188986 },
  { id: '6', name: 'Rasti 6', lat: 60.225513048236614, lng: 24.834978238203526 },
  { id: '7', name: 'Rasti 7', lat: 60.22576653637685, lng: 24.83049639929952 },
  { id: '8', name: 'Rasti 8', lat: 60.22411780754917, lng: 24.835651209554612 },
];

export const COLLECT_RADIUS_METERS = 30;

// Final destination: 60.22412344871136, 24.835624777988148
export const FINAL_DESTINATION = {
  lat: 60.22399814419737,
  lng: 24.828065533305967,
};

// Radius (meters) within which the destination counts as reached
export const DESTINATION_RADIUS = 10;

// Minimum checkpoints before any coordinate is revealed
export const MIN_CHECKPOINTS_FOR_REVEAL = 2;

// Reveal stages with separate digit counts for lat and lng
// Target: 60.22412344871136, 24.835624777988148
export const REVEAL_STAGES = [
  { checkpoints: 2, latDigits: 1, lngDigits: 1 },  // 60.2, 24.8
  { checkpoints: 3, latDigits: 2, lngDigits: 2 },  // 60.22, 24.84
  { checkpoints: 4, latDigits: 2, lngDigits: 3 },  // 60.22, 24.836
  { checkpoints: 5, latDigits: 3, lngDigits: 3 },  // 60.224, 24.836
  { checkpoints: 6, latDigits: 4, lngDigits: 4 },  // 60.2241, 24.8356
  { checkpoints: 7, latDigits: 5, lngDigits: 5 },  // 60.22412, 24.83562
  { checkpoints: 8, latDigits: 8, lngDigits: 8 },  // full precision
];
