import { Checkpoint } from '../types';

// 8 checkpoints in Mäkkylänmetsä forest, Espoo
export const CHECKPOINTS: Checkpoint[] = [
  {
    id: '1', name: 'Rasti 1',
    lat: 60.22342231225804, lng: 24.84101685311893,
    trivia: {
      question: 'Mitä näistä Maria harrastaa?',
      options: ['Soutu', 'Melonta', 'Purjehdus'],
      correctIndex: 0,
    },
  },
  {
    id: '2', name: 'Rasti 2',
    lat: 60.22335247608895, lng: 24.838351303799655,
    trivia: {
      question: 'Mitkä on Marian kissojen nimet?',
      options: ['Kissa & Koira', 'Kaisla & Cocoa', 'Viiru & Pesonen'],
      correctIndex: 1,
    },
  },
  {
    id: '3', name: 'Rasti 3',
    lat: 60.222468951130715, lng: 24.839360567342702,
    trivia: {
      question: 'Missä näistä kaupungeista Maria EI ole koskaan asunut?',
      options: ['Lahti', 'Helsinki', 'Vantaa'],
      correctIndex: 2,
    },
  },
  {
    id: '4', name: 'Rasti 4',
    lat: 60.225692281036366, lng: 24.83296139902883,
    trivia: {
      question: 'Mitä Maria tällä hetkellä opiskelee?',
      options: ['Biologiaa', 'Ympäristötieteitä', 'Ympäristöteknologiaa'],
      correctIndex: 1,
    },
  },
  {
    id: '5', name: 'Rasti 5',
    lat: 60.22425405648699, lng: 24.8324789188986,
    trivia: {
      question: 'Koska on Marian syntymäpäivä?',
      options: ['6.5.', '3.5.', '9.5.'],
      correctIndex: 0,
    },
  },
  {
    id: '6', name: 'Rasti 6',
    lat: 60.225513048236614, lng: 24.834978238203526,
    trivia: {
      question: 'Missä Maria on töissä?',
      options: ['Sosiaali- ja terveysministeriö', 'Terveyden ja hyvinvoinnin laitos', 'Maria ei ole tällä hetkellä töissä'],
      correctIndex: 1,
    },
  },
  {
    id: '7', name: 'Rasti 7',
    lat: 60.22576653637685, lng: 24.83049639929952,
    trivia: {
      question: 'Montako polkupyörää Maria omistaa?',
      options: ['1', '2', '3'],
      correctIndex: 1,
    },
  },
  {
    id: '8', name: 'Rasti 8',
    lat: 60.22411780754917, lng: 24.835651209554612,
    trivia: {
      question: 'Minkälaisesta musiikista Maria pitää?',
      options: ['Suomalaisesta uliulimusiikista', 'Energisistä tanssibiiseistä', 'Uudemmasta ranskalaisesta torvimusiikista'],
      correctIndex: 1,
    },
  },
];

export const COLLECT_RADIUS_METERS = 30;

// Final destination
export const FINAL_DESTINATION = {
  lat: 60.22399814419737,
  lng: 24.828065533305967,
};

export const DESTINATION_RADIUS = 10;
export const MIN_CHECKPOINTS_FOR_REVEAL = 2;

export const REVEAL_STAGES = [
  { checkpoints: 2, latDigits: 1, lngDigits: 1 },
  { checkpoints: 3, latDigits: 2, lngDigits: 2 },
  { checkpoints: 4, latDigits: 2, lngDigits: 3 },
  { checkpoints: 5, latDigits: 3, lngDigits: 3 },
  { checkpoints: 6, latDigits: 4, lngDigits: 4 },
  { checkpoints: 7, latDigits: 5, lngDigits: 5 },
  { checkpoints: 8, latDigits: 8, lngDigits: 8 },
];
