import 'server-only';
import { createNeonAuth } from '@neon/auth/next/server';
import { redirect } from 'next/navigation';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});

export async function getCurrentUser() {
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/sign-in');
  return user;
}

export async function requireCurrentUserId() {
  const user = await requireCurrentUser();
  return user.id;
}
