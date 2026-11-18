'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export type AuthFormState = { error: string } | null;

export async function signUpWithEmail(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (name.length < 2) return { error: 'Podaj imię lub nazwę o długości co najmniej 2 znaków.' };
  if (!email) return { error: 'Podaj adres e-mail.' };
  if (password.length < 8) return { error: 'Hasło musi mieć co najmniej 8 znaków.' };

  const { data, error } = await auth.signUp.email({ email, name, password });
  if (error) return { error: error.message || 'Nie udało się utworzyć konta.' };

  // Przypisz zestawy utworzone przed włączeniem logowania do pierwszego konta.
  if (data?.user?.id) {
    await prisma.deck.updateMany({ where: { ownerId: null }, data: { ownerId: data.user.id } });
  }
  redirect('/');
}

export async function signInWithEmail(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Wpisz adres e-mail i hasło.' };

  const { error } = await auth.signIn.email({ email, password });
  if (error) return { error: error.message || 'Nie udało się zalogować.' };
  redirect('/');
}

export async function signOut() {
  await auth.signOut();
  redirect('/auth/sign-in');
}
