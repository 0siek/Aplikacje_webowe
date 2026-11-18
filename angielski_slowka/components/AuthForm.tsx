'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, BookOpen, Check, Sparkles } from 'lucide-react';
import { claimLegacyDecks } from '@/actions/authActions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';

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

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)]">
      <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden="true" className="absolute -right-24 -top-20 size-[430px] rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-6 top-2 size-[290px] rounded-full border border-white/10" />
        <Link href="/" className="relative inline-flex w-fit items-center gap-2.5 text-lg font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-white/10"><BookOpen className="size-[18px]" /></span>słówka<span className="-ml-2 text-emerald-200">.</span></Link>
        <div className="relative max-w-lg">
          <Sparkles className="mb-6 size-6 text-emerald-200" />
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Ucz się języka w swoim rytmie.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-primary-foreground/70">Twoje zestawy, fiszki i postępy zawsze pod ręką.</p>
          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/80">
            {['Twórz własne kolekcje słówek', 'Ćwicz fiszki, rozwiązuj testy i sprinty', 'Zachowuj postępy na swoim koncie'].map((item) => <li key={item} className="flex items-center gap-2.5"><span className="grid size-5 place-items-center rounded-full bg-white/10"><Check className="size-3" /></span>{item}</li>)}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/55">Małe porcje. Wielkie postępy.</p>
      </aside>

      <section className="flex min-h-screen flex-col px-4 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <Link href="/" className="mb-6 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"><ArrowLeft className="size-4" /> Strona główna</Link>
          <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="px-0 pt-0 sm:px-6 sm:pt-6">
              <div className="mb-2 grid size-10 place-items-center rounded-xl bg-secondary text-primary lg:hidden"><BookOpen className="size-5" /></div>
              <CardTitle className="text-2xl tracking-tight">{isSignUp ? 'Utwórz konto' : 'Witaj ponownie'}</CardTitle>
              <CardDescription>{isSignUp ? 'Zapisuj swoje zestawy i wracaj do nauki na dowolnym urządzeniu.' : 'Zaloguj się, aby kontynuować naukę i otworzyć swoje zestawy.'}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && <div className="space-y-2"><Label htmlFor="name">Imię lub nazwa</Label><Input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="np. Patrycja" /></div>}
                <div className="space-y-2"><Label htmlFor="email">Adres e-mail</Label><Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder="ty@example.com" /></div>
                <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Hasło</Label>{!isSignUp && <Link href="/auth/forgot-password" className="text-xs font-medium text-primary underline-offset-4 hover:underline">Nie pamiętasz hasła?</Link>}</div><Input id="password" name="password" type="password" required minLength={8} maxLength={128} autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder={isSignUp ? 'Co najmniej 8 znaków' : 'Wpisz hasło'} /></div>
                {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
                <Button type="submit" className="w-full" size="lg" disabled={pending}>{pending ? 'Chwileczkę…' : isSignUp ? 'Utwórz konto' : 'Zaloguj się'}</Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">{isSignUp ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}{' '}<Link href={isSignUp ? '/auth/sign-in' : '/auth/sign-up'} className="font-medium text-primary underline-offset-4 hover:underline">{isSignUp ? 'Zaloguj się' : 'Utwórz konto'}</Link></p>
            </CardContent>
          </Card>
        </div>
        <footer className="mx-auto w-full max-w-md pb-2 text-center text-xs text-muted-foreground">Ucz się w swoim rytmie · słówka</footer>
      </section>
    </main>
  );
}
