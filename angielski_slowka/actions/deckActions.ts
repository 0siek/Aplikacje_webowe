'use server';

import { CardType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireCurrentUserId } from '@/lib/auth/server';
import type { StudyDeck } from '@/lib/types';

function requireDatabase() {
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    throw new Error('Ta operacja wymaga skonfigurowanej bazy PostgreSQL.');
  }
}

export async function getDecks() {
  const ownerId = await requireCurrentUserId();
  requireDatabase();
  const decks = await prisma.deck.findMany({
    where: { ownerId },
    include: { cards: true },
    orderBy: { updatedAt: 'desc' },
  });

  return decks.map((deck) => {
    const masteredCards = deck.cards.filter((card) => card.masteryLevel >= 3).length;
    return {
      ...deck,
      description: deck.description ?? '',
      totalCards: deck.cards.length,
      masteredCards,
      progressPercent: deck.cards.length ? Math.round((masteredCards / deck.cards.length) * 100) : 0,
    };
  });
}

export async function getDeck(deckId: string): Promise<StudyDeck | null> {
  const ownerId = await requireCurrentUserId();
  requireDatabase();
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, ownerId },
    include: { cards: { orderBy: { createdAt: 'asc' } } },
  });
  return deck ? {
    id: deck.id,
    title: deck.title,
    description: deck.description ?? '',
    cards: deck.cards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      cardType: card.cardType,
      masteryLevel: card.masteryLevel,
    })),
  } : null;
}

export async function saveDeckProgress(cardId: string, known: boolean) {
  const ownerId = await requireCurrentUserId();
  requireDatabase();
  if (!cardId) return;
  const card = await prisma.card.findFirst({
    where: { id: cardId, deck: { ownerId } },
    select: { masteryLevel: true },
  });
  if (!card) return;
  await prisma.card.updateMany({
    where: { id: cardId, deck: { ownerId } },
    data: {
      masteryLevel: known ? Math.min(card.masteryLevel + 1, 5) : Math.max(card.masteryLevel - 1, 0),
      lastReviewed: new Date(),
    },
  });
  revalidatePath('/');
}

export async function createDeck(formData: FormData) {
  const ownerId = await requireCurrentUserId();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!title) throw new Error('Podaj nazwę zestawu.');
  requireDatabase();
  const deck = await prisma.deck.create({ data: { ownerId, title, description: description || null } });
  revalidatePath('/');
  redirect(`/decks/${deck.id}/edit`);
}

export async function saveDeck(deckId: string, formData: FormData) {
  const ownerId = await requireCurrentUserId();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (!title) throw new Error('Podaj nazwę zestawu.');
  requireDatabase();
  const result = await prisma.deck.updateMany({
    where: { id: deckId, ownerId },
    data: { title, description: description || null },
  });
  if (!result.count) throw new Error('Nie znaleziono Twojego zestawu.');
  revalidatePath('/');
  revalidatePath(`/decks/${deckId}/edit`);
}

export async function deleteDeck(deckId: string) {
  const ownerId = await requireCurrentUserId();
  requireDatabase();
  const result = await prisma.deck.deleteMany({ where: { id: deckId, ownerId } });
  if (!result.count) throw new Error('Nie znaleziono Twojego zestawu.');
  revalidatePath('/');
}

export async function createCard(deckId: string, formData: FormData) {
  const ownerId = await requireCurrentUserId();
  const front = String(formData.get('front') ?? '').trim();
  const back = String(formData.get('back') ?? '').trim();
  const type = String(formData.get('cardType') ?? 'TRANSLATION');
  if (!front || !back) throw new Error('Uzupełnij słówko i odpowiedź.');
  if (type !== 'TRANSLATION' && type !== 'DEFINITION') throw new Error('Nieobsługiwany typ fiszki.');
  requireDatabase();
  const deck = await prisma.deck.findFirst({ where: { id: deckId, ownerId }, select: { id: true } });
  if (!deck) throw new Error('Nie znaleziono Twojego zestawu.');
  await prisma.card.create({ data: { deckId, front, back, cardType: type as CardType } });
  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath('/');
}

export async function deleteCard(deckId: string, cardId: string) {
  const ownerId = await requireCurrentUserId();
  requireDatabase();
  await prisma.card.deleteMany({ where: { id: cardId, deckId, deck: { ownerId } } });
  revalidatePath(`/decks/${deckId}/edit`);
  revalidatePath('/');
}
