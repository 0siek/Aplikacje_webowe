'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleCheck, CircleHelp, Clock3, Layers3, RotateCw, Sparkles, X } from 'lucide-react';
import { saveDeckProgress } from '@/actions/deckActions';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import type { StudyCard, StudyDeck } from '@/lib/types';

const modes = [
  { id: 'flashcards', label: 'Fiszki', description: 'Powtórz swoje słówka', icon: Layers3 },
  { id: 'test', label: 'Test', description: 'Sprawdź swoją wiedzę', icon: CircleCheck },
  { id: 'sprint', label: 'Sprint', description: '8 sekund na odpowiedź', icon: Clock3 },
  { id: 'reverse', label: 'Odwrotnie', description: 'Polski → angielski', icon: RotateCw },
] as const;

function answerAlternatives(answer: string) {
  return answer.split('/').map((part) => part.trim()).filter(Boolean);
}

function matchesAnswer(input: string, expected: string) {
  const normalizedInput = input.trim().toLocaleLowerCase();
  return answerAlternatives(expected).some((answer) => answer.toLocaleLowerCase() === normalizedInput);
}

function stableShuffle<T>(items: T[], seed: string) {
  const score = (value: string) => [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7);
  return [...items].sort((a, b) => score(`${seed}:${String(a)}`) - score(`${seed}:${String(b)}`));
}

function ProgressTrack({ value }: { value: number }) {
  return <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${value}%` }} /></div>;
}

function ResultScreen({ correct, total, onRestart }: { correct: number; total: number; onRestart: () => void }) {
  const score = total ? Math.round((correct / total) * 100) : 0;
  return <Card className="mx-auto mt-8 max-w-xl text-center">
    <CardContent className="flex flex-col items-center px-6 py-10 sm:px-10 sm:py-12">
      <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary"><Sparkles className="size-7" /></span>
      <Badge variant="secondary" className="mt-5">SESJA UKOŃCZONA</Badge>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Świetna robota!</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Każda powtórka przybliża Cię do celu. Zobacz podsumowanie sesji.</p>
      <div className="mt-7 grid w-full grid-cols-2 gap-3">
        <div className="rounded-xl border bg-muted/50 p-4"><div className="text-2xl font-semibold tracking-tight">{score}%</div><div className="mt-1 text-xs text-muted-foreground">Skuteczność</div></div>
        <div className="rounded-xl border bg-muted/50 p-4"><div className="text-2xl font-semibold tracking-tight">{correct}/{total}</div><div className="mt-1 text-xs text-muted-foreground">Poprawne odpowiedzi</div></div>
      </div>
      <Button onClick={onRestart} size="lg" className="mt-5 w-full"><RotateCw data-icon="inline-start" /> Powtórz sesję</Button>
      <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-2 w-full')}>Wróć do zestawów</Link>
    </CardContent>
  </Card>;
}

export default function StudySession({ deck, initialMode = 'flashcards' }: { deck: StudyDeck; initialMode?: string }) {
  const [mode, setMode] = useState(initialMode);
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const answeredCardIds = useRef(new Set<string>());
  const selectedAnswerRef = useRef<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionCooldown = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionLocked = useRef(false);

  // Keep this session's card order stable while async progress saves refresh deck data.
  const [cards] = useState<StudyCard[]>(() => [...deck.cards].sort((a, b) => a.masteryLevel - b.masteryLevel));
  const card = cards[position] ?? cards[0];
  const isTest = mode === 'test';
  const isSprint = mode === 'sprint';
  const isFlashcards = mode === 'flashcards';
  // Tests and Sprint now default to Polish → English for translation cards.
  // Definition cards have no Polish term, so retain their English → definition direction.
  const reverseDirection = mode === 'reverse' || isTest || isSprint;
  const question = card ? (reverseDirection && card.cardType === 'TRANSLATION' ? card.back : card.front) : '';
  const expectedAnswer = card ? (reverseDirection && card.cardType === 'TRANSLATION' ? card.front : card.back) : '';
  const currentAnswer = answers[position];
  const correctCount = answers.filter(Boolean).length;
  const complete = useCallback(() => setFinished(true), []);
  const recordCard = useCallback((current: StudyCard, known: boolean) => {
    void saveDeckProgress(current.id, known).catch(() => undefined);
  }, []);
  const answerCard = useCallback((known: boolean) => {
    if (!card || answeredCardIds.current.has(card.id) || interactionLocked.current) return false;
    answeredCardIds.current.add(card.id);
    interactionLocked.current = true;
    if (interactionCooldown.current) clearTimeout(interactionCooldown.current);
    interactionCooldown.current = setTimeout(() => { interactionLocked.current = false; }, 350);
    setAnswers((old) => { const next = [...old]; next[position] = known; return next; });
    if (known) setKnownIds((old) => old.includes(card.id) ? old : [...old, card.id]);
    recordCard(card, known);
    return true;
  }, [card, position, recordCard]);
  const goNext = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (position + 1 >= cards.length) { complete(); return; }
    setPosition(position + 1);
    setFlipped(false);
    setSelectedAnswer(null);
    selectedAnswerRef.current = null;
    setAnswerText('');
    setShowCorrectAnswer(false);
    setTimeLeft(8);
  }, [cards.length, complete, position]);
  const scheduleAdvance = useCallback((delay: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, delay);
  }, [goNext]);
  const restart = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (interactionCooldown.current) clearTimeout(interactionCooldown.current);
    advanceTimer.current = null;
    interactionCooldown.current = null;
    interactionLocked.current = false;
    answeredCardIds.current.clear();
    selectedAnswerRef.current = null;
    setRound((old) => old + 1);
    setPosition(0);
    setFlipped(false);
    setSelectedAnswer(null);
    setAnswerText('');
    setShowCorrectAnswer(false);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(8);
  }, []);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (interactionCooldown.current) clearTimeout(interactionCooldown.current);
  }, []);

  useEffect(() => {
    if (mode !== 'sprint' || finished || !card || selectedAnswer !== null || currentAnswer !== undefined) return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        if (answerCard(false)) {
          selectedAnswerRef.current = '__timeout__';
          setSelectedAnswer('__timeout__');
          scheduleAdvance(700);
        }
        return;
      }
      setTimeLeft((old) => old - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [answerCard, card, currentAnswer, finished, mode, scheduleAdvance, selectedAnswer, timeLeft]);

  const chooseAnswer = (choice: string) => {
    if (selectedAnswerRef.current !== null) return;
    const correct = matchesAnswer(choice, expectedAnswer);
    if (!answerCard(correct)) return;
    selectedAnswerRef.current = choice;
    setSelectedAnswer(choice);
    scheduleAdvance(950);
  };

  const submitRecall = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedAnswerRef.current !== null) return;
    const correct = matchesAnswer(answerText, expectedAnswer);
    if (!answerCard(correct)) return;
    if (correct) {
      goNext();
      return;
    }

    selectedAnswerRef.current = '__recall_wrong__';
    setSelectedAnswer('__recall_wrong__');
    setShowCorrectAnswer(true);
    scheduleAdvance(1500);
  };

  const progress = cards.length ? Math.round((position / cards.length) * 100) : 0;
  const choices = useMemo(() => {
    if (!card) return [];
    const getAnswer = (item: StudyCard) => reverseDirection && item.cardType === 'TRANSLATION' ? item.front : item.back;
    const accepted = answerAlternatives(expectedAnswer);
    const pool = cards.filter((item) => item.id !== card.id).flatMap((item) => answerAlternatives(getAnswer(item)));
    const shuffled = stableShuffle(pool, `${card.id}:${round}`).slice(0, 3);
    while (shuffled.length < 3) shuffled.push(['Nie wiem', 'Żadna z odpowiedzi', 'Spróbuję ponownie'][shuffled.length]);
    return stableShuffle([accepted[0] ?? expectedAnswer, ...shuffled], `${card.id}:${round}:answers`);
  }, [card, cards, expectedAnswer, reverseDirection, round]);

  if (!card) return <main className="grid min-h-screen place-items-center bg-background px-4"><Card className="max-w-md text-center"><CardContent className="px-8 py-10"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-secondary text-primary"><BookOpen /></span><h1 className="mt-4 text-xl font-semibold">Ten zestaw jest jeszcze pusty</h1><p className="mt-2 text-sm text-muted-foreground">Dodaj fiszki, aby rozpocząć naukę.</p><Link href={`/decks/${deck.id}/edit`} className={cn(buttonVariants(), 'mt-5')}>Dodaj fiszki</Link></CardContent></Card></main>;

  const handleModeChange = (next: string) => {
    if (next !== mode) { setMode(next); restart(); }
  };

  return <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" /><span className="hidden sm:inline">Wróć do zestawów</span></Link>
        <div className="min-w-0 text-center"><p className="truncate text-xs text-muted-foreground">{isTest ? 'Test' : isSprint ? 'Szybki sprint' : mode === 'reverse' ? 'Odwrotnie · Polski → angielski' : 'Tryb nauki'}</p><p className="max-w-[42vw] truncate text-sm font-medium">{deck.title}</p></div>
        <div className="flex items-center gap-1"><ThemeToggle /><Link href="/" aria-label="Zamknij naukę" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'text-muted-foreground')}><X className="size-4" /></Link></div>
      </div>
    </header>

    <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mb-5 flex gap-2 lg:hidden">
        {modes.map(({ id, label, icon: Icon }) => <Button key={id} variant={mode === id ? 'secondary' : 'outline'} size="sm" className="flex-1" onClick={() => handleModeChange(id)}><Icon className="size-4" />{label}</Button>)}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:gap-8">
        <aside className="hidden lg:block">
          <Card className="sticky top-20 shadow-none">
            <CardHeader className="pb-3"><CardDescription>TRYB NAUKI</CardDescription><CardTitle className="text-base">Wybierz ćwiczenie</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {modes.map(({ id, label, description, icon: Icon }) => <button key={id} onClick={() => handleModeChange(id)} className={cn('flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors', mode === id ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background ring-1 ring-border"><Icon className="size-[17px]" /></span><span className="min-w-0"><span className="block text-sm font-medium">{label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{description}</span></span>
              </button>)}
              <div className="my-4 border-t" />
              <div className="rounded-xl bg-muted/60 p-4"><div className="flex items-center justify-between text-sm"><span>Postęp</span><span className="font-medium">{knownIds.length}/{cards.length}</span></div><div className="mt-3"><ProgressTrack value={cards.length ? Math.round((knownIds.length / cards.length) * 100) : 0} /></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Każda powtórka przybliża Cię do celu.</p></div>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div><Badge variant="outline">{isFlashcards ? 'FISZKI' : isTest ? 'TEST' : isSprint ? 'SPRINT' : 'ODWROTNIE'}</Badge><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{isFlashcards ? 'Ucz się po swojemu' : isTest ? 'Sprawdź, co już wiesz' : isSprint ? 'Szybki sprint' : 'Polski → angielski'}</h1><p className="mt-1 text-sm text-muted-foreground">{isFlashcards ? 'Obróć kartę i zaznacz, jak dobrze znasz odpowiedź.' : isTest ? 'Wpisz odpowiedź albo wybierz jedną z propozycji. Pytania z tłumaczeń są po polsku.' : isSprint ? 'Odpowiedz przed upływem czasu. Pytania z tłumaczeń są po polsku.' : 'Wybierz angielskie tłumaczenie polskiego słówka.'}</p></div>
              <Badge variant="secondary" className="shrink-0 tabular-nums">{String(position + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</Badge>
            </div>
            <ProgressTrack value={progress} />

            {finished ? <ResultScreen correct={correctCount} total={cards.length} onRestart={restart} /> : <>
              {isSprint && <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium"><Clock3 className="size-4 text-primary" /><span className="tabular-nums">00:{String(timeLeft).padStart(2, '0')}</span><span className="text-muted-foreground">na odpowiedź</span></div>}

              {isFlashcards ? <div className="card-perspective mt-6 h-[300px] w-full sm:mt-8 sm:h-[390px]">
                <button type="button" onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Pokaż słówko' : 'Pokaż odpowiedź'} className={`card-flipper ${flipped ? 'is-flipped' : ''} relative h-full w-full text-left`}>
                  <span className="card-face absolute inset-0 flex flex-col rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
                    <span className="flex items-center justify-between"><Badge variant="secondary">{reverseDirection && card.cardType === 'TRANSLATION' ? 'SŁÓWKO PO POLSKU' : 'SŁÓWKO PO ANGIELSKU'}</Badge><BookOpen className="size-4 text-muted-foreground" /></span>
                    <span className="flex flex-1 flex-col items-center justify-center text-center"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Przetłumacz</span><span className="mt-4 break-words text-[clamp(32px,7vw,56px)] font-semibold leading-tight tracking-tight">{question}</span></span>
                    <span className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><RotateCw className="size-3.5" /> Kliknij kartę, aby zobaczyć odpowiedź</span>
                  </span>
                  <span className="card-face card-back absolute inset-0 flex flex-col rounded-2xl border bg-secondary p-5 shadow-sm sm:p-8">
                    <span className="flex items-center justify-between"><Badge variant="outline">{reverseDirection && card.cardType === 'TRANSLATION' ? 'SŁÓWKO PO ANGIELSKU' : card.cardType === 'DEFINITION' ? 'DEFINICJA PO ANGIELSKU' : 'TŁUMACZENIE PO POLSKU'}</Badge><BookOpen className="size-4 text-muted-foreground" /></span>
                    <span className="flex flex-1 items-center justify-center px-2 text-center text-[clamp(21px,4.4vw,36px)] font-medium leading-snug">{reverseDirection && card.cardType === 'TRANSLATION' ? card.front : card.back}</span>
                    <span className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><RotateCw className="size-3.5" /> Kliknij kartę, aby wrócić</span>
                  </span>
                </button>
              </div> : <Card className="mt-6 text-center shadow-sm sm:mt-8"><CardContent className="flex min-h-[220px] flex-col items-center justify-center px-5 py-8 sm:min-h-[260px]">
                <Badge variant="secondary">{reverseDirection && card.cardType === 'TRANSLATION' ? 'SŁÓWKO PO POLSKU' : card.cardType === 'DEFINITION' ? 'DEFINICJA PO ANGIELSKU' : 'PRZETŁUMACZ NA POLSKI'}</Badge>
                <p className="mt-5 break-words text-[clamp(29px,6vw,48px)] font-semibold leading-tight tracking-tight">{question}</p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{isTest ? 'Wpisz swoją odpowiedź albo wybierz jedną z propozycji.' : 'Wybierz poprawną odpowiedź, zanim skończy się czas!'}</p>
              </CardContent></Card>}

              {isFlashcards ? <div className="mx-auto mt-4 grid max-w-lg grid-cols-2 gap-3 sm:mt-5"><Button variant="outline" size="lg" className="border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => { if (answerCard(false)) goNext(); }}><CircleHelp data-icon="inline-start" /> Powtórz</Button><Button size="lg" onClick={() => { if (answerCard(true)) goNext(); }}><Check data-icon="inline-start" /> Znam</Button></div> : <>
                {isTest && <><form onSubmit={submitRecall} className="mx-auto mt-4 flex max-w-3xl gap-2"><Input value={answerText} onChange={(event) => setAnswerText(event.target.value)} aria-label="Wpisz odpowiedź" placeholder="Wpisz swoją odpowiedź…" className="h-11" disabled={selectedAnswer !== null} /><Button type="submit" disabled={!answerText.trim() || selectedAnswer !== null} className="h-11">Sprawdź</Button></form>{showCorrectAnswer && <p role="status" aria-live="polite" className="mx-auto mt-3 max-w-3xl rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm"><span className="font-medium">Niepoprawna odpowiedź.</span> Poprawna odpowiedź: <span className="font-semibold">{expectedAnswer}</span></p>}</>}
                <div className="mx-auto mt-3 grid max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-2">{choices.map((choice, index) => {
                  const right = matchesAnswer(choice, expectedAnswer);
                  const selected = selectedAnswer === choice;
                  const style = selected ? right ? 'border-primary bg-secondary text-secondary-foreground' : 'border-destructive/50 bg-destructive/5 text-destructive' : selectedAnswer !== null && right ? 'border-primary/40 bg-secondary/60' : 'hover:border-primary/40 hover:bg-muted/50';
                  return <button key={`${choice}-${index}`} type="button" disabled={selectedAnswer !== null} onClick={() => chooseAnswer(choice)} className={cn('flex min-h-14 items-center gap-3 rounded-xl border bg-card px-3.5 py-3 text-left text-sm transition-colors disabled:cursor-default', style)}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">{String.fromCharCode(65 + index)}</span><span className="flex-1 leading-5">{choice}</span>{selected && (right ? <Check className="size-4" /> : <X className="size-4" />)}</button>;
                })}</div>
              </>}

              <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between border-t pt-4 text-xs text-muted-foreground"><span>{knownIds.length} opanowanych <span className="mx-1.5">·</span> {cards.length - knownIds.length} do nauki</span>{isFlashcards && <Button onClick={goNext} variant="ghost" size="sm">Pomiń kartę <ArrowRight data-icon="inline-end" /></Button>}</div>
            </>}
          </div>
        </section>
      </div>
    </main>
  </div>;
}
