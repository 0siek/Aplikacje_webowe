import 'server-only';
import { CardType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface ImportedCard {
  front: string;
  back: string;
  cardType?: 'TRANSLATION' | 'DEFINITION';
}

interface ImportedDeck {
  title: string;
  description?: string;
  cards: ImportedCard[];
}

function validateDeck(value: unknown, index: number): ImportedDeck {
  if (!value || typeof value !== 'object') throw new Error(`Zestaw ${index + 1} musi być obiektem.`);
  const deck = value as Partial<ImportedDeck>;
  if (typeof deck.title !== 'string' || !deck.title.trim()) throw new Error(`Zestaw ${index + 1} wymaga nazwy.`);
  if (!Array.isArray(deck.cards)) throw new Error(`Zestaw ${index + 1} wymaga tablicy cards.`);
  const cards = deck.cards.map((card, cardIndex) => {
    if (!card || typeof card.front !== 'string' || !card.front.trim() || typeof card.back !== 'string' || !card.back.trim()) {
      throw new Error(`Fiszka ${cardIndex + 1} w zestawie ${index + 1} ma nieprawidłowe pola.`);
    }
    if (card.cardType && card.cardType !== 'TRANSLATION' && card.cardType !== 'DEFINITION') {
      throw new Error(`Fiszka ${cardIndex + 1} ma nieprawidłowy cardType.`);
    }
    return { front: card.front.trim(), back: card.back.trim(), cardType: card.cardType ?? 'TRANSLATION' };
  });
  return { title: deck.title.trim(), description: deck.description?.trim(), cards };
}

/** Waliduje i importuje JSON z adaptera Google Drive albo z lokalnego pliku. */
export class ImportService {
  static async importFromJsonString(jsonString: string): Promise<number> {
    let parsed: unknown;
    try { parsed = JSON.parse(jsonString); }
    catch { throw new Error('Nieprawidłowy plik JSON.'); }

    const input = Array.isArray(parsed) ? parsed : [parsed];
    if (input.length === 0) return 0;
    const decks = input.map(validateDeck);

    await prisma.$transaction(decks.map((deck) => prisma.deck.create({
      data: {
        title: deck.title,
        description: deck.description || null,
        cards: { create: deck.cards.map((card) => ({
          front: card.front,
          back: card.back,
          cardType: card.cardType === 'DEFINITION' ? CardType.DEFINITION : CardType.TRANSLATION,
        })) },
      },
    })));
    return decks.length;
  }
}
