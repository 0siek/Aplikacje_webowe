'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, BookOpen, Check, Plus, Trash2 } from 'lucide-react';
import { createCard, createDeck, deleteCard, deleteDeck, saveDeck } from '@/actions/deckActions';
import type { StudyDeck } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ThemeToggle from '@/components/ThemeToggle';

export default function DeckEditor({ deck, isNew }: { deck?: StudyDeck; isNew: boolean }) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();

  async function run(action: () => Promise<void>) {
    setError('');
    setPending(true);
    try { await action(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Nie udało się zapisać zmian.'); }
    finally { setPending(false); }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/90">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> Moje zestawy</Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <Badge variant="secondary">KOLEKCJA SŁÓWEK</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{isNew ? 'Utwórz zestaw' : 'Edytuj zestaw'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Dodaj słówka i definicje, a potem ćwicz je w wybranym trybie.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="size-4 text-primary" /> Informacje o zestawie</CardTitle>
            <CardDescription>Nazwij swoją kolekcję i dodaj krótki opis.</CardDescription>
          </CardHeader>
          <form action={(formData) => run(() => isNew ? createDeck(formData) : saveDeck(deck!.id, formData))}>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label htmlFor="deck-title">Nazwa zestawu <span className="text-destructive">*</span></Label><Input id="deck-title" name="title" required maxLength={90} defaultValue={deck?.title} placeholder="np. Angielski w podróży" /></div>
              <div className="space-y-2"><Label htmlFor="deck-description">Opis <span className="font-normal text-muted-foreground">(opcjonalnie)</span></Label><Textarea id="deck-description" name="description" maxLength={240} rows={3} defaultValue={deck?.description ?? ''} placeholder="Czego dotyczy ten zestaw?" /></div>
              {error && <Alert variant="destructive"><AlertTitle>Nie udało się zapisać</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            </CardContent>
            <CardFooter className="justify-between gap-3">
              {!isNew ? <div className="flex items-center gap-2">
                {showDelete ? <><span className="text-sm text-muted-foreground">Usunąć zestaw?</span><Button type="button" size="sm" variant="destructive" disabled={pending} onClick={() => run(async () => { await deleteDeck(deck!.id); router.push('/'); })}>Tak, usuń</Button><Button type="button" size="sm" variant="ghost" onClick={() => setShowDelete(false)}>Anuluj</Button></> : <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}><Trash2 data-icon="inline-start" /> Usuń zestaw</Button>}
              </div> : <span />}
              <Button type="submit" disabled={pending}>{pending ? 'Zapisywanie…' : isNew ? 'Utwórz zestaw' : 'Zapisz zmiany'} {!pending && <Check data-icon="inline-end" />}</Button>
            </CardFooter>
          </form>
        </Card>

        {!isNew && deck && <section className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2 text-base"><LayersIcon /> Fiszki</CardTitle><CardDescription className="mt-1">{deck.cards.length} {deck.cards.length === 1 ? 'karta' : 'kart'} w zestawie</CardDescription></div>
              <Badge variant="outline">Angielski → polski / definicja</Badge>
            </CardHeader>
            <CardContent>
              {deck.cards.length ? <div className="divide-y rounded-xl border">
                {deck.cards.map((card) => <div key={card.id} className="flex items-start gap-3 p-3.5 sm:p-4">
                  <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{card.front}</p><p className="mt-1 break-words text-sm text-muted-foreground">{card.back}</p></div>
                  <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">{card.cardType === 'DEFINITION' ? 'Definicja' : 'Tłumaczenie'}</Badge>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Usuń fiszkę ${card.front}`} onClick={() => run(() => deleteCard(deck.id, card.id))}><Trash2 className="size-4 text-muted-foreground" /></Button>
                </div>)}
              </div> : <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">Nie ma jeszcze fiszek. Dodaj pierwszą poniżej.</p>}

              <form action={(formData) => run(() => createCard(deck.id, formData))} className="mt-5 rounded-xl bg-muted/60 p-4 sm:p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium"><Plus className="size-4 text-primary" /> Dodaj fiszkę</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="card-front">Słówko po angielsku</Label><Input id="card-front" name="front" required maxLength={180} placeholder="e.g. resilient" /></div>
                  <div className="space-y-2"><Label htmlFor="card-back">Tłumaczenie lub definicja</Label><Textarea id="card-back" name="back" required maxLength={1000} rows={1} placeholder="np. odporny, wytrwały" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="card-type">Typ odpowiedzi</Label><select id="card-type" name="cardType" defaultValue="TRANSLATION" className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"><option value="TRANSLATION">Tłumaczenie na polski</option><option value="DEFINITION">Definicja po angielsku</option></select></div>
                </div>
                {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="mt-4 flex justify-end"><Button type="submit" variant="secondary" disabled={pending}><Plus data-icon="inline-start" /> Dodaj fiszkę</Button></div>
              </form>
            </CardContent>
          </Card>
        </section>}
      </div>
    </main>
  );
}

function LayersIcon() {
  return <BookOpen className="size-4 text-primary" />;
}
