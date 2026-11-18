'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { saveDeckProgress } from '@/actions/deckActions';
import type { StudyCard, StudyDeck } from '@/lib/types';

const iconPaths = {
  back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h12" /></>,
  rotate: <><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" /></>,
  sound: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  timer: <><circle cx="12" cy="13" r="9"/><path d="M12 9v4l2 2M9 2h6"/></>,
  cards: <><rect x="3" y="5" width="16" height="15" rx="2"/><path d="M7 5V3h12a2 2 0 0 1 2 2v11h-2"/></>,
};
function Icon({ name, size = 18, strokeWidth = 1.8 }: { name: keyof typeof iconPaths; size?: number; strokeWidth?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

function stableShuffle<T>(items: T[], seed: string) {
  const score = (value: string) => [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7);
  return [...items].sort((a, b) => score(`${seed}:${String(a)}`) - score(`${seed}:${String(b)}`));
}

function Header({ deck, label }: { deck: StudyDeck; label: string }) {
  const [muted, setMuted] = useState(true);
  return <header className="sticky top-0 z-20 border-b border-[#e8ece8] bg-[#f7f8f5]/95 backdrop-blur-lg">
    <div className="mx-auto flex h-[66px] max-w-[1480px] items-center justify-between px-4 sm:px-8 xl:px-12">
      <Link href="/" className="group flex items-center gap-2.5" aria-label="Wróć do pulpitu">
        <span className="grid h-[35px] w-[35px] place-items-center rounded-[12px] bg-[#1f4033] text-[#d2f36b]"><Icon name="cards" size={19}/></span>
        <span className="text-[18px] font-extrabold tracking-[-.6px] text-[#1f4033]">słówka<span className="text-[#76a25c]">.</span></span>
      </Link>
      <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center sm:flex">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#829087]">{label}</span>
        <span className="mt-0.5 text-[13px] font-semibold text-[#33433a]">{deck.title}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Włącz dźwięk' : 'Wycisz dźwięk'} className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-[#e4e9e3] bg-white text-[#59665e] transition hover:border-[#bacbbc] hover:text-[#274633]"><Icon name="sound" size={17}/></button>
        <Link href="/" aria-label="Zamknij naukę" className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-[#e4e9e3] bg-white text-[#59665e] transition hover:border-[#e6c8c0] hover:text-[#aa5447]"><Icon name="close" size={18}/></Link>
      </div>
    </div>
  </header>;
}

function SidePanel({ activeMode, cardsCount, knownCount, onModeChange }: { activeMode: string; cardsCount: number; knownCount: number; onModeChange: (mode: string) => void }) {
  const progress = cardsCount ? Math.round((knownCount / cardsCount) * 100) : 0;
  const modes = [
    { id: 'flashcards', label: 'Fiszki', desc: 'Powtórz swoje słówka', icon: 'cards' as const },
    { id: 'test', label: 'Test', desc: 'Sprawdź swoją wiedzę', icon: 'check' as const },
    { id: 'sprint', label: 'Sprint', desc: '8 sekund na odpowiedź', icon: 'timer' as const },
  ];
  return <aside className="hidden w-[270px] shrink-0 flex-col rounded-[20px] border border-[#e7ebe5] bg-white p-4 lg:flex">
    <div className="px-2 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[1.05px] text-[#919b94]">TRYB NAUKI</div>
    <div className="space-y-1">
      {modes.map((mode) => <button key={mode.id} onClick={() => onModeChange(mode.id)} className={`group flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left transition ${activeMode === mode.id ? 'bg-[#edf5ea]' : 'hover:bg-[#f7f8f5]'}`}>
        <span className={`grid h-[34px] w-[34px] place-items-center rounded-[10px] ${activeMode === mode.id ? 'bg-[#dfeeda] text-[#345a41]' : 'bg-[#f0f3ed] text-[#738076]'}`}><Icon name={mode.icon}/></span>
        <span className="min-w-0 flex-1"><span className={`block text-[13px] font-semibold ${activeMode === mode.id ? 'text-[#2b4e37]' : 'text-[#435149]'}`}>{mode.label}</span><span className="mt-0.5 block truncate text-[10.5px] text-[#89938c]">{mode.desc}</span></span>
        {activeMode === mode.id && <span className="h-1.5 w-1.5 rounded-full bg-[#59845b]"/>}
      </button>)}
    </div>
    <div className="my-4 border-t border-[#edf0eb]"/>
    <div className="px-2 text-[10px] font-bold uppercase tracking-[1.05px] text-[#919b94]">O TYM ZESTAWIE</div>
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f7f9f6] px-3 py-3 text-[#4d5b52]"><Icon name="cards" size={16}/><span className="text-[12px] font-medium">{cardsCount} fiszek</span></div>
    <div className="mt-auto rounded-[15px] bg-[#eef5eb] p-4">
      <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#4a624c]">Twoje postępy</span><span className="text-[13px] font-bold text-[#345a3d]">{progress}%</span></div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#dce8d7]"><div className="h-full rounded-full bg-[#789f69] transition-[width] duration-300" style={{width:`${progress}%`}}/></div>
      <p className="mt-2.5 text-[10.5px] leading-relaxed text-[#768474]">Świetnie Ci idzie! Każda powtórka przybliża Cię do celu.</p>
    </div>
  </aside>;
}

function ResultScreen({ correct, total, onRestart }: { correct: number; total: number; onRestart: () => void }) {
  const score = total ? Math.round((correct / total) * 100) : 0;
  return <div className="mx-auto flex max-w-[430px] flex-col items-center px-5 py-10 text-center sm:py-14">
    <div className="grid h-[112px] w-[112px] place-items-center rounded-full bg-[#edf5e9]"><div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-[#dbeed5] text-[#486e48]"><Icon name="spark" size={38}/></div></div>
    <span className="mt-7 text-[10px] font-bold uppercase tracking-[1.6px] text-[#789078]">SESJA UKOŃCZONA</span>
    <h2 className="mt-2 text-[30px] font-extrabold tracking-[-1px] text-[#253b2d]">Świetna robota!</h2>
    <p className="mt-2 text-[13px] leading-relaxed text-[#7d8981]">Każdy krok to bliżej do płynności.<br/>Zobacz, jak Ci poszło.</p>
    <div className="mt-7 grid w-full grid-cols-2 gap-3">
      <div className="rounded-[15px] border border-[#e8ece6] bg-white p-4"><div className="text-[24px] font-extrabold text-[#2c4535]">{score}%</div><div className="mt-1 text-[10px] font-medium text-[#8a958d]">SKUTECZNOŚĆ</div></div>
      <div className="rounded-[15px] border border-[#e8ece6] bg-white p-4"><div className="text-[24px] font-extrabold text-[#3e6544]">{correct}/{total}</div><div className="mt-1 text-[10px] font-medium text-[#8a958d]">POPRAWNE</div></div>
    </div>
    <button onClick={onRestart} className="mt-5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#244a35] text-[13px] font-bold text-white shadow-sm transition hover:bg-[#193d2a]"><Icon name="rotate"/> Powtórz sesję</button>
    <Link href="/" className="mt-3 flex h-[46px] w-full items-center justify-center rounded-[12px] border border-[#e6ebe5] bg-white text-[13px] font-semibold text-[#4c5c50] transition hover:bg-[#f7f8f5]">Wróć do zestawów</Link>
  </div>;
}

export default function StudySession({ deck, initialMode = 'flashcards' }: { deck: StudyDeck; initialMode?: string }) {
  const [mode, setMode] = useState(initialMode);
  const [round, setRound] = useState(0);
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);
  const [knownIds, setKnownIds] = useState<string[]>([]);

  const cards = useMemo(() => [...deck.cards].sort((a, b) => a.masteryLevel - b.masteryLevel), [deck.cards]);
  const card = cards[position] ?? cards[0];
  const currentAnswer = answers[position];
  const correctCount = answers.filter(Boolean).length;
  const complete = useCallback(() => setFinished(true), []);
  const recordCard = useCallback((current: StudyCard, known: boolean) => {
    void saveDeckProgress(current.id, known).catch(() => undefined);
  }, []);
  const answerCard = useCallback((known: boolean) => {
    if (!card || answers[position] !== undefined) return;
    setAnswers((old) => { const next = [...old]; next[position] = known; return next; });
    if (known) setKnownIds((old) => old.includes(card.id) ? old : [...old, card.id]);
    recordCard(card, known);
  }, [answers, card, position, recordCard]);
  const goNext = useCallback(() => {
    if (position + 1 >= cards.length) { complete(); return; }
    setPosition((old) => old + 1); setFlipped(false); setSelectedAnswer(null); setAnswerText(''); setTimeLeft(8);
  }, [cards.length, complete, position]);
  const restart = useCallback(() => {
    setRound((old) => old + 1); setPosition(0); setFlipped(false); setSelectedAnswer(null); setAnswerText(''); setAnswers([]); setFinished(false); setTimeLeft(8);
  }, []);

  useEffect(() => {
    if (mode !== 'sprint' || finished || !card || selectedAnswer !== null || currentAnswer !== undefined) return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) { answerCard(false); return; }
      setTimeLeft((old) => old - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [answerCard, card, currentAnswer, finished, mode, selectedAnswer, timeLeft]);

  useEffect(() => {
    if (selectedAnswer === null) return;
    const timer = window.setTimeout(() => {
      if (position + 1 >= cards.length) complete();
      else { setPosition((old) => old + 1); setSelectedAnswer(null); setAnswerText(''); setTimeLeft(8); }
    }, 950);
    return () => window.clearTimeout(timer);
  }, [cards.length, complete, position, selectedAnswer]);

  const isTest = mode === 'test';
  const isSprint = mode === 'sprint';
  const isFlashcards = mode === 'flashcards';
  const progress = Math.round((position / cards.length) * 100);
  const choices = useMemo(() => {
    if (!card) return [];
    const pool = cards.filter((item) => item.id !== card.id).map((item) => item.back);
    const shuffled = stableShuffle(pool, `${card.id}:${round}`).slice(0, 3);
    while (shuffled.length < 3) shuffled.push(['Nie wiem', 'Żadna z odpowiedzi', 'Spróbuję ponownie'][shuffled.length]);
    return stableShuffle([card.back, ...shuffled], `${card.id}:${round}:answers`);
  }, [card, cards, round]);

  if (!card) return <main className="grid min-h-[65vh] place-items-center px-5 text-center"><div><h1 className="text-2xl font-bold">Ten zestaw jest jeszcze pusty</h1><p className="mt-2 text-sm text-[#78857e]">Dodaj fiszki, aby rozpocząć naukę.</p><Link href={`/decks/${deck.id}/edit`} className="mt-5 inline-flex rounded-xl bg-[#244a35] px-5 py-3 text-sm font-semibold text-white">Dodaj fiszki</Link></div></main>;

  return <>
    <Header deck={deck} label={isTest ? 'TEST' : isSprint ? 'SZYBKI SPRINT' : 'TRYB NAUKI'}/>
    <main className="mx-auto max-w-[1480px] px-4 pb-10 pt-6 sm:px-8 sm:pt-8 xl:px-12">
      <div className="mb-5 flex items-center justify-between lg:hidden"><div><div className="text-[9px] font-bold uppercase tracking-[1.2px] text-[#829087]">{deck.title}</div><div className="mt-1 text-[13px] font-semibold text-[#33433a]">{isTest ? 'Test' : isSprint ? 'Szybki Sprint' : 'Fiszki'}</div></div><button onClick={() => setMode(mode === 'flashcards' ? 'test' : mode === 'test' ? 'sprint' : 'flashcards')} className="rounded-xl border border-[#e4e9e3] bg-white px-3 py-2 text-[11px] font-semibold text-[#526057]">Zmień tryb</button></div>
      <div className="flex items-start gap-6">
        <SidePanel activeMode={mode} cardsCount={cards.length} knownCount={knownIds.length} onModeChange={(next) => { if (next !== mode) { setMode(next); restart(); } }}/>
        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-[860px]">
            <div className="flex items-end justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[1.15px] text-[#839087]">{isFlashcards ? 'KARTA' : isTest ? 'PYTANIE' : 'NA CZAS'}</div><h1 className="mt-1 text-[21px] font-extrabold tracking-[-.6px] text-[#263a2d] sm:text-[25px]">{isFlashcards ? 'Ucz się po swojemu' : isTest ? 'Sprawdź, co już wiesz' : 'Szybki Sprint'}</h1></div><span className="rounded-full border border-[#e5eae3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#68756c]">{String(position + 1).padStart(2, '0')} <span className="mx-1 text-[#a9b1aa]">/</span> {String(cards.length).padStart(2, '0')}</span></div>
            <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-[#e8ece6]"><div className="h-full rounded-full bg-[#80a676] transition-[width] duration-500" style={{width:`${isFlashcards ? progress : Math.round((position / cards.length) * 100)}%`}}/></div>
            {finished ? <ResultScreen correct={correctCount} total={cards.length} onRestart={restart}/> : <>
              {isSprint && <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-[#edf5e9] px-3.5 py-2 text-[12px] font-bold text-[#416447]"><Icon name="timer" size={15}/><span>00:{String(timeLeft).padStart(2, '0')}</span><span className="font-normal text-[#7e927c]">na odpowiedź</span></div>}
              <div className="mt-5">
                {isFlashcards ? <div className="card-perspective mx-auto h-[300px] w-full max-w-[690px] sm:h-[380px]">
                  <button onClick={() => setFlipped(!flipped)} aria-label="Odwróć fiszkę" className={`card-flipper ${flipped ? 'is-flipped' : ''} relative h-full w-full text-left`}>
                    <span className="card-face absolute inset-0 flex flex-col rounded-[23px] border border-[#e7ebe5] bg-white p-5 shadow-[0_9px_28px_rgba(37,58,43,.06)] sm:p-8">
                      <span className="flex items-center justify-between"><span className="rounded-full bg-[#edf5e9] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.9px] text-[#577859]">SŁÓWKO PO ANGIELSKU</span><Icon name="sound" size={17}/></span>
                      <span className="flex flex-1 flex-col items-center justify-center text-center"><span className="text-[9px] font-semibold uppercase tracking-[1px] text-[#a1aaa2]">PRZETŁUMACZ</span><span className="mt-3 break-words text-[clamp(32px,7vw,54px)] font-extrabold leading-[1.1] tracking-[-1.5px] text-[#273d2e]">{card.front}</span></span>
                      <span className="flex items-center justify-center gap-2 text-[10px] font-medium text-[#929c94]"><Icon name="rotate" size={14}/> Kliknij kartę, aby zobaczyć odpowiedź</span>
                    </span>
                    <span className="card-face card-back absolute inset-0 flex flex-col rounded-[23px] border border-[#dfebdc] bg-[#f0f6ec] p-5 shadow-[0_9px_28px_rgba(37,58,43,.06)] sm:p-8">
                      <span className="flex items-center justify-between"><span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.9px] text-[#698066]">{card.cardType === 'DEFINITION' ? 'DEFINICJA PO ANGIELSKU' : 'TŁUMACZENIE PO POLSKU'}</span><Icon name="sound" size={17}/></span>
                      <span className="flex flex-1 items-center justify-center px-2 text-center text-[clamp(21px,4.4vw,35px)] font-semibold leading-[1.35] text-[#35523a]">{card.back}</span>
                      <span className="flex items-center justify-center gap-2 text-[10px] font-medium text-[#879584]"><Icon name="rotate" size={14}/> Kliknij kartę, aby wrócić</span>
                    </span>
                  </button>
                </div> : <div className="mx-auto flex min-h-[205px] max-w-[690px] flex-col items-center justify-center rounded-[22px] border border-[#e7ebe5] bg-white px-5 py-7 text-center shadow-[0_9px_28px_rgba(37,58,43,.05)] sm:min-h-[235px] sm:py-9">
                  <span className="rounded-full bg-[#edf5e9] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.9px] text-[#577859]">{card.cardType === 'DEFINITION' ? 'DEFINICJA PO ANGIELSKU' : 'PRZETŁUMACZ NA POLSKI'}</span>
                  <span className="mt-5 break-words text-[clamp(29px,6vw,46px)] font-extrabold leading-tight tracking-[-1px] text-[#273d2e]">{card.front}</span>
                  <span className="mt-2 max-w-[550px] text-[13px] leading-relaxed text-[#7d8a7f]">{isTest ? 'Wpisz swoją odpowiedź albo wybierz jedną z propozycji.' : 'Wybierz poprawną odpowiedź, zanim skończy się czas!'}</span>
                </div>}

                {isFlashcards ? <div className="mx-auto mt-5 grid max-w-[490px] grid-cols-2 gap-3"><button onClick={() => { answerCard(false); goNext(); }} className="flex h-[51px] items-center justify-center gap-2 rounded-[13px] border border-[#eddcd4] bg-[#fff8f5] text-[12px] font-bold text-[#9b614e] transition hover:bg-[#fff0e9] active:scale-[.98]"><span className="text-[15px]">↻</span> Powtórz</button><button onClick={() => { answerCard(true); goNext(); }} className="flex h-[51px] items-center justify-center gap-2 rounded-[13px] bg-[#244a35] text-[12px] font-bold text-white transition hover:bg-[#193d2a] active:scale-[.98]"><Icon name="check" size={16}/> Znam</button></div> : <>
                  {isTest && <form onSubmit={(event) => { event.preventDefault(); const correct = answerText.trim().toLocaleLowerCase() === card.back.trim().toLocaleLowerCase(); setAnswers((old) => { const next = [...old]; next[position] = correct; return next; }); if (correct) setKnownIds((old) => old.includes(card.id) ? old : [...old, card.id]); recordCard(card, correct); goNext(); }} className="mx-auto mt-4 flex max-w-[690px] gap-2"><input value={answerText} onChange={(event) => setAnswerText(event.target.value)} aria-label="Wpisz odpowiedź" placeholder="Wpisz swoją odpowiedź…" className="h-[46px] min-w-0 flex-1 rounded-[12px] border border-[#e5eae3] bg-white px-4 text-[13px] text-[#34463a] outline-none placeholder:text-[#a0aaa2] focus:border-[#98b790]"/><button type="submit" disabled={!answerText.trim()} className="rounded-[12px] bg-[#244a35] px-4 text-[12px] font-bold text-white disabled:opacity-40">Sprawdź</button></form>}
                  <div className="mx-auto mt-4 grid max-w-[690px] grid-cols-1 gap-2.5 sm:grid-cols-2">{choices.map((choice, index) => { const right = choice === card.back; const selected = selectedAnswer === choice; return <button key={`${choice}-${index}`} disabled={selectedAnswer !== null} onClick={() => { setSelectedAnswer(choice); const correct = right; setAnswers((old) => { const next = [...old]; next[position] = correct; return next; }); if (correct) setKnownIds((old) => old.includes(card.id) ? old : [...old, card.id]); recordCard(card, correct); }} className={`flex min-h-[52px] items-center gap-3 rounded-[13px] border px-3.5 text-left text-[12px] font-medium transition active:scale-[.99] ${selected ? right ? 'border-[#a8c9a1] bg-[#edf6e9] text-[#456946]' : 'border-[#e4b8ae] bg-[#fff0ec] text-[#a75c4c]' : selectedAnswer !== null && right ? 'border-[#c7dbc1] bg-[#f1f7ee] text-[#4f714e]' : 'border-[#e6ebe5] bg-white text-[#536158] hover:border-[#c5d7bf] hover:bg-[#fafcf8]'}`}><span className={`grid h-[27px] w-[27px] shrink-0 place-items-center rounded-[8px] text-[10px] font-bold ${selected ? right ? 'bg-[#d7ebcf] text-[#50754c]' : 'bg-[#f3d8d0] text-[#a75c4c]' : 'bg-[#f3f5f1] text-[#849087]'}`}>{String.fromCharCode(65 + index)}</span><span className="line-clamp-2 flex-1 leading-relaxed">{choice}</span>{selected && <Icon name={right ? 'check' : 'close'} size={16}/>}</button>; })}</div>
                </>}
              </div>
              <div className="mx-auto mt-5 flex max-w-[690px] items-center justify-between border-t border-[#e7ebe5] pt-4"><div className="flex items-center gap-1.5 text-[10px] font-medium text-[#919b94]"><span className="mr-1 text-[14px] text-[#7d9b72]">◎</span><span className="font-bold text-[#63716a]">{knownIds.length}</span> opanowanych <span className="mx-1 text-[#c2c9c1]">·</span><span className="font-bold text-[#63716a]">{cards.length - knownIds.length}</span> do nauki</div>{isFlashcards && <button onClick={goNext} className="flex items-center gap-1 text-[10px] font-semibold text-[#89948c] hover:text-[#435c49]">Pomiń kartę <Icon name="back" size={14}/></button>}</div>
            </>}
          </div>
        </section>
      </div>
      <footer className="safe-bottom mt-8 hidden items-center justify-between border-t border-[#e8ece6] pt-4 lg:flex"><Link href="/" className="text-[10px] font-medium text-[#839087] transition hover:text-[#48584c]">© 2024 słówka.</Link><span className="flex items-center gap-1.5 text-[10px] text-[#8a958d]">Ucz się odrobinę każdego dnia <span className="text-[#89a67c]">✦</span></span><Link href={`/decks/${deck.id}/edit`} className="text-[10px] font-medium text-[#839087] transition hover:text-[#48584c]">Edytuj zestaw</Link></footer>
    </main>
  </>;
}
