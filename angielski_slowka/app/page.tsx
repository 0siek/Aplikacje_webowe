import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowRight, BookOpen, Check, Layers3, Plus, Sparkles } from 'lucide-react';
import { getDecks } from '@/actions/deckActions';
import AppHeader from '@/components/AppHeader';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const instant = false;

const deckAccents = [
  'bg-emerald-50 text-emerald-800 ring-emerald-100',
  'bg-amber-50 text-amber-800 ring-amber-100',
  'bg-sky-50 text-sky-800 ring-sky-100',
  'bg-violet-50 text-violet-800 ring-violet-100',
];

export default async function DashboardPage() {
  await connection();
  const decks = await getDecks();
  const cardCount = decks.reduce((sum, deck) => sum + deck.totalCards, 0);
  const mastered = decks.reduce((sum, deck) => sum + deck.masteredCards, 0);
  const averageProgress = cardCount ? Math.round((mastered / cardCount) * 100) : 0;
  const firstDeck = decks[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader active="decks" />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-sm">
          <div aria-hidden="true" className="absolute -right-16 -top-28 -z-10 size-[390px] rounded-full border border-white/10 sm:-right-3 sm:-top-48 sm:size-[570px]" />
          <div aria-hidden="true" className="absolute -right-4 -top-16 -z-10 size-[280px] rounded-full border border-white/10 sm:right-16 sm:-top-28 sm:size-[390px]" />
          <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:px-12 lg:py-12">
            <div className="max-w-2xl">
              <Badge variant="outline" className="border-white/20 bg-white/10 text-primary-foreground">
                <Sparkles data-icon="inline-start" /> TWÓJ CODZIENNY RYTM
              </Badge>
              <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[44px]">
                Małe porcje. <span className="text-emerald-200">Wielkie postępy.</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75 sm:text-base">
                Wróć do swoich słówek, zrób krótką powtórkę i utrwalaj angielski we własnym tempie.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={firstDeck ? `/decks/${firstDeck.id}/study` : '/decks/new'} className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'bg-white text-primary hover:bg-white/90')}>
                  <BookOpen data-icon="inline-start" /> Zacznij naukę <ArrowRight data-icon="inline-end" />
                </Link>
                <Link href="/decks/new" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'border-white/25 bg-white/5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground')}>
                  <Plus data-icon="inline-start" /> Utwórz zestaw
                </Link>
              </div>
            </div>

            <Card className="hidden border-white/15 bg-white/10 text-primary-foreground shadow-none lg:block">
              <CardHeader className="pb-3">
                <CardDescription className="text-primary-foreground/65">Twoja kolekcja</CardDescription>
                <CardTitle className="text-lg font-medium">Nauka, która mieści się w planie dnia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div><div className="text-4xl font-semibold tracking-tight">{String(cardCount).padStart(2, '0')}</div><div className="mt-1 text-xs text-primary-foreground/65">fiszek do powtórki</div></div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-white/10"><Layers3 className="size-5" /></div>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-primary-foreground/75"><span>Średni postęp</span><span className="font-medium text-white">{averageProgress}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-200 transition-all" style={{ width: `${averageProgress}%` }} /></div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section aria-label="Podsumowanie nauki" className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Zestawy', value: decks.length, hint: 'Twoje kolekcje', icon: Layers3 },
            { label: 'Fiszki', value: cardCount, hint: 'Słówka i definicje', icon: BookOpen },
            { label: 'Opanowane', value: `${averageProgress}%`, hint: `${mastered} dobrze znanych fiszek`, icon: Check },
          ].map(({ label, value, hint, icon: Icon }) => (
            <Card key={label} className="shadow-none transition-shadow hover:shadow-sm">
              <CardContent className="flex items-center justify-between p-4 sm:p-5">
                <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-[18px]" /></span>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="zestawy" className="mt-10 scroll-mt-24 sm:mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Twoje zestawy</h2><p className="mt-1 text-sm text-muted-foreground">Wybierz zestaw i ćwicz tak, jak lubisz.</p></div>
            <Link href="/decks/new" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden sm:inline-flex')}><Plus data-icon="inline-start" /> Dodaj zestaw</Link>
          </div>

          {decks.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center px-6 py-14 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><BookOpen className="size-5" /></span>
                <h3 className="mt-4 text-base font-semibold">Twoja kolekcja zaczyna się tutaj</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Utwórz pierwszy zestaw albo zaimportuj fiszki z pliku CSV.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/decks/new" className={buttonVariants({ size: 'sm' })}><Plus data-icon="inline-start" /> Utwórz zestaw</Link>
                  <Link href="/decks/import" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Importuj CSV</Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {decks.map((deck, index) => (
                <Card key={deck.id} className="group shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${deckAccents[index % deckAccents.length]}`}><BookOpen className="size-[18px]" /></span>
                      <Badge variant="secondary" className="font-normal">{deck.totalCards} {deck.totalCards === 1 ? 'fiszka' : 'fiszek'}</Badge>
                    </div>
                    <CardTitle className="pt-1 text-base font-semibold">{deck.title}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-10 leading-5">{deck.description || 'Bez opisu — gotowy na Twoje słówka.'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Postęp</span><span className="font-medium">{deck.progressPercent}%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${deck.progressPercent}%` }} /></div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <Link href={`/decks/${deck.id}/study`} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'px-2')}><BookOpen className="size-3.5" /> Fiszki</Link>
                      <Link href={`/decks/${deck.id}/test`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'px-2')}>Test</Link>
                      <Link href={`/decks/${deck.id}/sprint`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'px-2')}>Sprint</Link>
                    </div>
                    <Link href={`/decks/${deck.id}/edit`} className="mt-4 inline-flex text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Edytuj zestaw</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4 sm:hidden"><Link href="/decks/new" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}><Plus data-icon="inline-start" /> Dodaj zestaw</Link></div>
        </section>

        <footer className="mt-12 flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} słówka. Ucz się w swoim rytmie.</span><span>Małe kroki, wielkie efekty.</span>
        </footer>
      </main>
    </div>
  );
}
