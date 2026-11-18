'use server';

import { CardType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { demoDecks } from '@/lib/demo-data';
import type { StudyDeck } from '@/lib/types';

const hasDatabase = () => Boolean(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL);

export async function getDecks() {
  if (!hasDatabase()) {
    return demoDecks.map((deck) => {
      const masteredCards = deck.cards.filter((card) => card.masteryLevel >= 3).length;
      return { ...deck, description: deck.description, totalCards: deck.cards.length, masteredCards,
        progressPercent: Math.round((masteredCards / deck.cards.length) * 100) };
    });
  }

  const decks = await prisma.deck.findMany({ include: { cards: true }, orderBy: { updatedAt: 'desc' } });
  return decks.map((deck) => {
    const masteredCards = deck.cards.filter((card) => card.masteryLevel >= 3).length;
    return { ...deck, totalCards: deck.cards.length, masteredCards,
      progressPercent: deck.cards.length ? Math.round((masteredCards / deck.cards.length) * 100) : 0 };
  });
}

export async function getDeck(deckId: string): Promise<StudyDeck | null> {
  if (!hasDatabase()) return demoDecks.find((deck) => deck.id === deckId) ?? null;
  const deck = await prisma.deck.findUnique({ where: { id: deckId }, include: { cards: { orderBy: { createdAt: 'asc' } } } });
  return deck ? { ...deck, description: deck.description ?? '', cards: deck.cards.map((card) => ({
    id: card.id, front: card.front, back: card.back, cardType: card.cardType, masteryLevel: card.masteryLevel,
  })) } : null;
}

export async function saveDeckProgress(cardId: string, known: boolean) {
  if (!hasDatabase() || !cardId) return;
  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { masteryLevel: true } });
  if (!card) return;
  await prisma.card.update({ where: { id: cardId }, data: {
    masteryLevel: known ? Math.min(card.masteryLevel + 1, 5) : Math.max(card.masteryLevel - 1, 0),
    lastReviewed: new Date(),
  } });
  revalidatePath('/');
}

export async function createDeck(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!title) throw new Error('Podaj nazwę zestawu.');
  if (!hasDatabase()) throw new Error('Dodawanie zestawów wymaga konfiguracji bazy PostgreSQL.');
  const deck = await prisma.deck.create({ data: { title, description: description || null } });
  revalidatePath('/');
  redirect(`/decks/${deck.id}/edit`);
}

export async function saveDeck(deckId: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!title) throw new Error('Podaj nazwę zestawu.');
  if (!hasDatabase()) throw new Error('Edycja zestawów wymaga konfiguracji bazy PostgreSQL.');
  await prisma.deck.update({ where: { id: deckId }, data: { title, description: description || null } });
  revalidatePath('/');
  revalidatePath(`/decks/${deckId}/edit`);
}

export async function deleteDeck(deckId: string) {
  if (!hasDatabase()) throw new Error('Usuwanie zestawów wymaga konfiguracji bazy PostgreSQL.');
  await prisma.deck.delete({ where: { id: deckId } });
  revalidatePath('/');
}

export async function createCard(deckId: string, formData: FormData) {
  const front = String(formData.get('front') ?? '').trim();
  const back = String(formData.get('back') ?? '').trim();
  const type = String(formData.get('cardType') ?? 'TRANSLATION');
  if (!front || !back) throw new Error('Uzupełnij słówko i odpowiedź.');
  if (type !== 'TRANSLATION' && type !== 'DEFINITION') throw new Error('Nieobsługiwany typ fiszki.');
  if (!hasDatabase()) throw new Error('Dodawanie fiszek wymaga konfiguracji bazy PostgreSQL.');
  await prisma.card.create({ data: { deckId, front, back, cardType: type as CardType } });
  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath('/');
}

export async function deleteCard(deckId: string, cardId: string) {
  if (!hasDatabase()) throw new Error('Usuwanie fiszek wymaga konfiguracji bazy PostgreSQL.');
  await prisma.card.deleteMany({ where: { id: cardId, deckId } });
  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath('/');
}
