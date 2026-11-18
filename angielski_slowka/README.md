# Słówka

Responsywna aplikacja do nauki angielskich słówek, zbudowana na Next.js App Router, React Server Components, Tailwind CSS 4, TypeScript i Prisma/PostgreSQL.

## Funkcje

- Pulpit z zestawami, liczbą fiszek i procentem opanowania.
- Tworzenie, edycja i usuwanie zestawów oraz dodawanie i usuwanie fiszek.
- Fiszki z tłumaczeniem polskim lub definicją angielską.
- Nauka z kartą 3D, test wyboru/wpisywania oraz sprint z ośmiosekundowym limitem.
- `ImportService` gotowy do rozszerzenia o pliki JSON z Google Drive.

## Uruchomienie lokalne

Wymagany jest Node.js 22 lub nowszy.

```bash
npm install
Copy-Item .env.example .env
# Wstaw połączenie PostgreSQL do POSTGRES_PRISMA_URL w .env
npm run db:generate
npm run db:migrate
npm run dev
```

Do uruchomienia aplikacji potrzebne są zmienne Neon Auth oraz połączenie z bazą PostgreSQL.

## Baza Neon, Object Storage i wdrożenie

1. Utwórz projekt w Vercel i połącz repozytorium Git.
2. W Neonie utwórz projekt w regionie wspierającym Object Storage, a następnie połącz repo poleceniami `npx neon@latest init` i `npx neon@latest deploy`.
3. `neon.ts` deklaruje prywatny bucket `assets`. CLI pobiera lokalnie `DATABASE_URL`, `DATABASE_URL_UNPOOLED` i poświadczenia `AWS_*` do `.env.local`. Aplikacja akceptuje także `POSTGRES_PRISMA_URL` dla zgodności z Vercel Postgres.
4. Na Vercel dodaj te same zmienne w Settings → Environment Variables dla Production, Preview i Development. Nie commituj `.env`, `.env.local` ani sekretów.
5. Uruchom `npm run db:deploy`, aby zastosować migracje na bazie. `DATABASE_URL_UNPOOLED` jest używany do migracji, a pooled `DATABASE_URL` do aplikacji.
6. `npm run verify:neon` sprawdza `SELECT 1` w Postgres oraz wykonuje tymczasowy upload, download i delete w bucketcie.

Moduł `services/neonStorage.ts` udostępnia prywatne uploady obrazów (JPG, PNG, WebP, HEIC, do 8 MB), krótkotrwałe URL-e odczytu i usuwanie obiektów. Nie ma jeszcze formularza uploadu ani OCR w UI.

Neon Object Storage wymaga, aby region projektu wspierał usługę (m.in. AWS Europe Central 1 / Frankfurt).

## Import danych

Serwis `services/importService.ts` przyjmuje JSON zestawu lub tablicę zestawów: `{ "title": "Podróże", "description": "...", "cards": [{ "front": "journey", "back": "podróż", "cardType": "TRANSLATION" }] }`. Integrację z Google Drive można dodać jako osobny adapter, przekazując jego zawartość do serwisu importu.

## Główne katalogi

```text
actions/           Server Actions
app/               App Router, strony pulpitu i trybów nauki
components/        Formularze logowania i edytor zestawów
lib/               Prisma, typy domenowe i konfiguracja sesji
prisma/            Schemat i migracje PostgreSQL
services/          Usługi danych, w tym import JSON
```

## Logowanie i wdrozenie

Logowanie e-mail/haslo jest obslugiwane przez Neon Auth. Google OAuth pozostaje poza zakresem tej wersji. Ekrany `/auth/forgot-password`, `/auth/reset-password` i `/auth/reset-link-sent` korzystaja ze wspoldzielonej wysylki Neon, wiec nie wymagaja wlasnego SMTP. Reset hasla wymaga wlaczonego logowania e-mail/haslo w ustawieniach Better Auth. `neon deploy` pobiera `NEON_AUTH_BASE_URL` do `.env.local`; `NEON_AUTH_COOKIE_SECRET` jest generowany osobno i nie wolno go commitowac. Na Vercel dodaj obie zmienne w ustawieniach projektu dla Production, Preview i Development. Po zmianie zmiennych uruchom ponownie deployment.

Migracja `20261118180000_add_deck_owner` dodaje wlasciciela zestawu. Zestawy sprzed logowania zostana przypisane pierwszemu kontu, ktore sie zarejestruje. Przed publicznym uruchomieniem rozważ wlaczenie weryfikacji e-mail. Wlasny SMTP jest potrzebny dla linkow weryfikacyjnych i niezawodnej wysylki; wspoldzielona poczta Neon obsluguje kody weryfikacyjne i reset hasla, ale ma limity.
