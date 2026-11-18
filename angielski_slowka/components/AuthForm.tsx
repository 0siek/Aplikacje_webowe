'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth/client';
import { claimLegacyDecks } from '@/actions/authActions';

export default function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignUp = mode === 'sign-up';
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, name, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setErrorMessage(result.error.message || 'Nie udało się uwierzytelnić. Sprawdź dane i spróbuj ponownie.');
        return;
      }

      if (isSignUp) await claimLegacyDecks();
      router.replace('/');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setPending(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f7f8f5] px-4 py-10">
    <section className="w-full max-w-[420px] rounded-[20px] border border-[#e6ebe4] bg-white p-6 shadow-[0_12px_38px_rgba(39,60,44,.07)] sm:p-8">
      <Link href="/" className="flex w-fit items-center gap-2.5">
        <span className="grid h-[35px] w-[35px] place-items-center rounded-[12px] bg-[#1f4033] text-[17px] font-bold text-[#d2f36b]">s.</span>
        <span className="text-[18px] font-extrabold tracking-[-.6px] text-[#1f4033]">słówka<span className="text-[#76a25c]">.</span></span>
      </Link>

      <h1 className="mt-7 text-[25px] font-extrabold tracking-[-.7px] text-[#293e30]">{isSignUp ? 'Załóż konto' : 'Zaloguj się'}</h1>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[#7f8c82]">{isSignUp ? 'Twoje zestawy i postępy będą zapisane na Twoim koncie.' : 'Zaloguj się, aby otworzyć swoje zestawy.'}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isSignUp && <label className="block text-[10px] font-bold text-[#56655a]">Imię lub nazwa
          <input name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="np. Patrycja" className="mt-1.5 h-[43px] w-full rounded-[10px] border border-[#e5eae3] bg-[#fcfdfb] px-3.5 text-[12px] font-medium text-[#36473b] outline-none placeholder:font-normal placeholder:text-[#a4ada5] focus:border-[#95b58b]" />
        </label>}
        <label className="block text-[10px] font-bold text-[#56655a]">Adres e-mail
          <input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="ty@example.com" className="mt-1.5 h-[43px] w-full rounded-[10px] border border-[#e5eae3] bg-[#fcfdfb] px-3.5 text-[12px] font-medium text-[#36473b] outline-none placeholder:font-normal placeholder:text-[#a4ada5] focus:border-[#95b58b]" />
        </label>
        <label className="block text-[10px] font-bold text-[#56655a]">Hasło
          <input name="password" type="password" required minLength={8} maxLength={128} autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder="Co najmniej 8 znaków" className="mt-1.5 h-[43px] w-full rounded-[10px] border border-[#e5eae3] bg-[#fcfdfb] px-3.5 text-[12px] font-medium text-[#36473b] outline-none placeholder:font-normal placeholder:text-[#a4ada5] focus:border-[#95b58b]" />
        </label>

        {errorMessage && <p role="alert" className="rounded-lg bg-[#fff1ed] px-3 py-2.5 text-[11px] text-[#a75543]">{errorMessage}</p>}

        <button disabled={pending} className="h-[43px] w-full rounded-[10px] bg-[#244a35] px-5 text-[11px] font-bold text-white transition hover:bg-[#193d2a] disabled:opacity-50">
          {pending ? 'Chwileczkę…' : isSignUp ? 'Utwórz konto' : 'Zaloguj się'}
        </button>
      </form>

      {!isSignUp && <Link href="/auth/forgot-password" className="mt-4 flex justify-center text-[11px] font-semibold text-[#547250] underline decoration-[#b9cbb2] underline-offset-2">
        Nie pamiętasz hasła?
      </Link>}

      <p className="mt-5 text-center text-[11px] text-[#7f8c82]">
        {isSignUp ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}{' '}
        <Link href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'} className="font-bold text-[#547250] underline decoration-[#b9cbb2] underline-offset-2">
          {isSignUp ? 'Zaloguj się' : 'Utwórz konto'}
        </Link>
      </p>
    </section>
  </main>;
}
