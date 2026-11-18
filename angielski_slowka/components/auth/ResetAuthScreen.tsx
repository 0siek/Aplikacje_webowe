'use client';

import { AuthProvider } from '@/components/auth/auth-provider';
import { Auth } from '@/components/auth/auth';
import { Toaster } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth/client';
import { getSafeRedirectTo } from '@better-auth-ui/core';
import { BookOpen } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const polishLocalization = {
  errors: { generic: 'Nie udało się wykonać tej czynności. Spróbuj ponownie.' },
  auth: {
    email: 'Adres e-mail',
    emailPlaceholder: 'ty@example.com',
    fieldRequired: 'To pole jest wymagane.',
    invalidEmail: 'Wpisz poprawny adres e-mail.',
    forgotPassword: 'Nie pamiętasz hasła?',
    sendResetLink: 'Wyślij link do resetu',
    rememberYourPassword: 'Pamiętasz hasło?',
    signIn: 'Zaloguj się',
    checkYourEmailTitle: 'Sprawdź pocztę',
    passwordResetEmailSent: 'Jeśli konto z tym adresem istnieje, wyślemy wiadomość z linkiem do zmiany hasła.',
    resetLinkSentTo: 'Link do zmiany hasła wysłaliśmy na {{email}}.',
    resetPassword: 'Ustaw nowe hasło',
    password: 'Nowe hasło',
    confirmPassword: 'Powtórz nowe hasło',
    confirmPasswordPlaceholder: 'Wpisz ponownie nowe hasło',
    newPasswordPlaceholder: 'Wpisz nowe hasło',
    tooShort: 'Hasło musi mieć co najmniej {{min}} znaków.',
    tooLong: 'Hasło może mieć maksymalnie {{max}} znaków.',
    passwordsDoNotMatch: 'Hasła nie są takie same.',
    invalidResetPasswordToken: 'Link do zmiany hasła jest nieprawidłowy lub wygasł.',
    passwordResetSuccess: 'Hasło zostało zmienione. Możesz się zalogować.',
    passwordCompromised: 'Wybierz inne hasło.',
    showPassword: 'Pokaż hasło',
    hidePassword: 'Ukryj hasło',
  },
};

export default function ResetAuthScreen({ view }: { view: 'forgotPassword' | 'resetPassword' | 'resetLinkSent' }) {
  const router = useRouter();

  return <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
    <section className="w-full max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/auth/sign-in" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="size-[18px]" /></span>
          <span>słówka<span className="text-primary">.</span></span>
        </Link>
        <ThemeToggle />
      </div>
      <AuthProvider
        authClient={authClient}
        emailAndPassword={{ enabled: true, forgotPassword: true, minPasswordLength: 8, maxPasswordLength: 128, requireEmailVerification: false }}
        localization={polishLocalization}
        Link={Link}
        navigate={({ to, replace }) => {
          const safePath = getSafeRedirectTo(to, window.location.origin);
          const target = safePath.startsWith('//') ? '/auth/sign-in' : safePath;
          if (replace) router.replace(target);
          else router.push(target);
        }}
        redirectTo="/auth/sign-in"
      >
        <Auth view={view} className="rounded-2xl border bg-card shadow-sm" />
        <Toaster />
      </AuthProvider>
    </section>
  </main>;
}
