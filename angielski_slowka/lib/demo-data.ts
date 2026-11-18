import type { StudyDeck } from './types';

export const demoDecks: StudyDeck[] = [
  {
    id: 'daily-english',
    title: 'Angielski na co dzień',
    description: 'Praktyczne słówka, które przydadzą się każdego dnia.',
    cards: [
      { id: 'apple', front: 'apple', back: 'jabłko', cardType: 'TRANSLATION', masteryLevel: 4 },
      { id: 'borrow', front: 'borrow', back: 'pożyczyć od kogoś', cardType: 'TRANSLATION', masteryLevel: 2 },
      { id: 'quiet', front: 'quiet', back: 'cichy, spokojny', cardType: 'TRANSLATION', masteryLevel: 5 },
      { id: 'improve', front: 'improve', back: 'poprawiać, ulepszać', cardType: 'TRANSLATION', masteryLevel: 1 },
      { id: 'reliable', front: 'reliable', back: 'Able to be trusted or depended on.', cardType: 'DEFINITION', masteryLevel: 3 },
    ],
  },
  {
    id: 'travel',
    title: 'Podróże i przygody',
    description: 'Odkrywaj świat bez językowych przeszkód.',
    cards: [
      { id: 'journey', front: 'journey', back: 'podróż', cardType: 'TRANSLATION', masteryLevel: 2 },
      { id: 'luggage', front: 'luggage', back: 'bagaż', cardType: 'TRANSLATION', masteryLevel: 1 },
      { id: 'shelter', front: 'shelter', back: 'A place giving temporary protection from bad weather or danger.', cardType: 'DEFINITION', masteryLevel: 0 },
      { id: 'departure', front: 'departure', back: 'odjazd, odlot', cardType: 'TRANSLATION', masteryLevel: 3 },
    ],
  },
  {
    id: 'big-ideas',
    title: 'Wielkie idee',
    description: 'Precyzyjne słownictwo do rozmów i tekstów.',
    cards: [
      { id: 'resilient', front: 'resilient', back: 'Able to withstand or recover quickly from difficult conditions.', cardType: 'DEFINITION', masteryLevel: 1 },
      { id: 'curious', front: 'curious', back: 'ciekawy, dociekliwy', cardType: 'TRANSLATION', masteryLevel: 3 },
      { id: 'insight', front: 'insight', back: 'wnikliwe spostrzeżenie', cardType: 'TRANSLATION', masteryLevel: 0 },
    ],
  },
  {
    id: 'city-break',
    title: 'Miejski weekend',
    description: 'Kawiarnie, galerie i spacery — po angielsku.',
    cards: [
      { id: 'neighbourhood', front: 'neighbourhood', back: 'dzielnica, okolica', cardType: 'TRANSLATION', masteryLevel: 4 },
      { id: 'exhibit', front: 'exhibit', back: 'wystawiać; eksponat', cardType: 'TRANSLATION', masteryLevel: 2 },
      { id: 'venue', front: 'venue', back: 'A place where an event or activity happens.', cardType: 'DEFINITION', masteryLevel: 2 },
    ],
  },
];
