'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ArrowLeft, FileUp, FileText } from 'lucide-react';
import { importDeckFromCsv } from '@/actions/importActions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const initialState = { status: 'idle' as const };

export default function CsvDeckImport() {
  const [state, formAction, pending] = useActionState(importDeckFromCsv, initialState);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6"><Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /> Moje zestawy</Link></div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 grid size-10 place-items-center rounded-xl bg-secondary text-primary"><FileUp className="size-5" /></div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Importuj zestaw z CSV</h1>
          <p className="mt-2 text-sm text-muted-foreground">Wczytaj plik tekstowy, aby dodać wiele fiszek naraz.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Szczegóły zestawu</CardTitle><CardDescription>Wybierz nazwę i plik z fiszkami.</CardDescription></CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label htmlFor="csv-title">Nazwa zestawu <span className="text-destructive">*</span></Label><Input id="csv-title" name="title" required maxLength={90} placeholder="np. Podróże i przygody" /></div>
              <div className="space-y-2"><Label htmlFor="csv-description">Opis <span className="font-normal text-muted-foreground">(opcjonalnie)</span></Label><Textarea id="csv-description" name="description" maxLength={240} rows={3} placeholder="Czego dotyczy ten zestaw?" /></div>
              <div className="space-y-2"><Label htmlFor="csv-file">Plik CSV <span className="text-destructive">*</span></Label><Input id="csv-file" name="file" required type="file" accept=".csv,text/csv" className="h-auto min-h-10 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:font-medium file:text-secondary-foreground" /><p className="text-xs text-muted-foreground">Maksymalnie 1000 fiszek i 512 KB.</p></div>
              <div className="rounded-xl border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium"><FileText className="size-4 text-primary" /> Wymagany format</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Pierwszy wiersz powinien zawierać nagłówki <code className="rounded bg-background px-1.5 py-0.5 text-xs">front;back;cardType</code>. Obsługiwany jest separator średnik lub przecinek. Typ fiszki: <code className="rounded bg-background px-1.5 py-0.5 text-xs">TRANSLATION</code> albo <code className="rounded bg-background px-1.5 py-0.5 text-xs">DEFINITION</code>.</p>
                <a href="/przykladowy-zestaw.csv" download className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">Pobierz przykładowy CSV</a>
              </div>

              {state.status === 'error' && <Alert variant="destructive"><AlertTitle>Nie udało się zaimportować</AlertTitle><AlertDescription>{state.message}</AlertDescription></Alert>}
              {state.status === 'success' && <Alert><FileUp className="text-primary" /><AlertTitle>Import zakończony</AlertTitle><AlertDescription>Dodano {state.cardCount} fiszek. <Link href={`/decks/${state.deckId}/edit`} className="font-medium text-primary underline-offset-4 hover:underline">Otwórz zestaw</Link></AlertDescription></Alert>}
            </CardContent>
            <CardFooter className="justify-end"><Button type="submit" disabled={pending}>{pending ? 'Importowanie…' : 'Importuj zestaw'} {!pending && <FileUp data-icon="inline-end" />}</Button></CardFooter>
          </form>
        </Card>
        <Link href="/decks/new" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'mt-4 px-0')}>Wolisz dodać zestaw ręcznie?</Link>
      </div>
    </main>
  );
}
