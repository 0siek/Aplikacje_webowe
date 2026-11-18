export type CardType = 'TRANSLATION' | 'DEFINITION';

export type StudyCard = {
  id: string;
  front: string;
  back: string;
  cardType: CardType;
  masteryLevel: number;
};

export type StudyDeck = {
  id: string;
  title: string;
  description: string;
  cards: StudyCard[];
};
