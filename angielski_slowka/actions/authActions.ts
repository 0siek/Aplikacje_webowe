'use server';

import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function claimLegacyDecks() {
  const { data } = await auth.getSession();
  const userId = data?.user?.id;
  if (!userId) return;

  // Zachowaj zestawy utworzone przed włączeniem kont i przypisz je tylko raz.
  await prisma.deck.updateMany({ where: { ownerId: null }, data: { ownerId: userId } });
}

export async function signOut() {
  await auth.signOut();
  redirect('/auth/sign-in');
}
