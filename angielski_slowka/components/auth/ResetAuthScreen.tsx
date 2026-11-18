'use client';

import { AuthProvider } from '@/components/auth/auth-provider';
import { Auth } from '@/components/auth/auth';
import { Toaster } from '@/components/ui/sonner';
import { authClient } from '@/lib/auth/client';
import { getSafeRedirectTo } from '@better-auth-ui/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const polishLocalization = {
  errors: {
    generic: 'Nie udało się wykonać tej czynności. Spróbuj ponownie.',
  },
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

  return <main className="grid min-h-screen place-items-center bg-[#f7f8f5] px-4 py-10">
    <section className="w-full max-w-[420px]">
      <Link href="/auth/sign-in" className="mx-auto mb-5 flex w-fit items-center gap-2.5">
        <span className="grid h-[35px] w-[35px] place-items-center rounded-[12px] bg-[#1f4033] text-[17px] font-bold text-[#d2f36b]">s.</span>
        <span className="text-[18px] font-extrabold tracking-[-.6px] text-[#1f4033]">słówka<span className="text-[#76a25c]">.</span></span>
      </Link>
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
        <Auth view={view} className="border-[#e6ebe4] shadow-[0_12px_38px_rgba(39,60,44,.07)]" />
        <Toaster />
      </AuthProvider>
    </section>
  </main>;
}
