'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { importDeckFromCsv } from '@/actions/importActions';

const initialState = { status: 'idle' as const };

export default function CsvDeckImport() {
  const [state, formAction, pending] = useActionState(importDeckFromCsv, initialState);

  return <main className="min-h-screen bg-[#f7f8f5]">
    <header className="border-b border-[#e8ece8] bg-white/75">
      <div className="mx-auto flex h-[64px] max-w-[950px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="text-[13px] font-semibold text-[#58665d] hover:text-[#253f2e]">← Wróć do zestawów</Link>
        <span className="text-[12px] font-bold text-[#34483a]">Import z CSV</span>
        <span className="w-[94px]" />
      </div>
    </header>

    <div className="mx-auto max-w-[780px] px-4 py-8 sm:px-8 sm:py-11">
      <div className="mb-6">
        <span className="text-[9px] font-bold uppercase tracking-[1.1px] text-[#7e967a]">SZYBKI IMPORT</span>
        <h1 className="mt-2 text-[27px] font-extrabold tracking-[-.8px] text-[#293e30]">Dodaj zestaw z pliku CSV</h1>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#7f8c82]">Wybierz plik, nadaj zestawowi nazwę, a fiszki zaimportują się razem.</p>
      </div>

      <form action={formAction} className="rounded-[17px] border border-[#e6ebe4] bg-white p-4 shadow-[0_5px_18px_rgba(39,60,44,.035)] sm:p-6">
        <label className="mb-4 block text-[10px] font-bold text-[#56655a]">
          Nazwa zestawu <span className="text-[#b36a56">*</span>
          <input name="title" required maxLength={90} placeholder="np. Podróże i przygody" className="mt-1.5 h-[43px] w-full rounded-[10px] border border-[#e5eae3] bg-[#fcfdfb] px-3.5 text-[12px] font-medium text-[#36473b] outline-none placeholder:font-normal placeholder:text-[#a4ada5] focus:border-[#95b58b]" />
        </label>

        <label className="mb-5 block text-[10px] font-bold text-[#56655a]">
          Opis <span className="font-normal text-[#9ba49c]">(opcjonalny)</span>
          <textarea name="description" maxLength={240} rows={2} placeholder="Czego dotyczy ten zestaw?" className="mt-1.5 w-full resize-y rounded-[10px] border border-[#e5eae3] bg-[#fcfdfb] px-3.5 py-3 text-[12px] font-normal text-[#36473b] outline-none placeholder:text-[#a4ada5] focus:border-[#95b58b]" />
        </label>

        <label className="block text-[10px] font-bold text-[#56655a]">
          Plik CSV <span className="text-[#b36a56">*</span>
          <input name="file" required type="file" accept=".csv,text/csv" className="mt-1.5 block min-h-[45px] w-full rounded-[10px] border border-[#e5eae3] bg-[#fcfdfb] p-2 text-[11px] text-[#536258] file:mr-3 file:rounded-[7px] file:border-0 file:bg-[#edf4e9] file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-[#4e704b]" />
        </label>

        <div className="mt-4 rounded-[11px] bg-[#f5f8f3] p-3.5 text-[10px] leading-relaxed text-[#6e7e71] sm:p-4">
          <p className="font-bold text-[#4d604f]">Format pliku</p>
          <p className="mt-1">Pierwszy wiersz powinien zawierać nagłówki <code className="rounded bg-white px-1">front;back;cardType</code>. Obsługiwany jest separator średnik albo przecinek. Typ fiszki to <code className="rounded bg-white px-1">TRANSLATION</code> lub <code className="rounded bg-white px-1">DEFINITION</code>; pominięty typ oznacza tłumaczenie.</p>
          <a href="/przykladowy-zestaw.csv" download className="mt-2 inline-flex font-bold text-[#547250] underline decoration-[#b9cbb2] underline-offset-2 hover:text-[#2a4c32]">Pobierz przykładowy CSV</a>
          <p className="mt-1">Maksymalnie 1000 fiszek i 512 KB. Zawartość jest walidowana przed zapisem.</p>
        </div>

        {state.status === 'error' && <p role="alert" className="mt-4 rounded-lg bg-[#fff1ed] px-3 py-2 text-[11px] text-[#a75543]">{state.message}</p>}
        {state.status === 'success' && <div role="status" className="mt-4 rounded-lg bg-[#edf5e9] px-3 py-3 text-[11px] text-[#4e704b]">Zaimportowano {state.cardCount} fiszek. <Link href={`/decks/${state.deckId}/edit`} className="ml-1 font-bold underline">Otwórz zestaw</Link></div>}

        <div className="mt-5 flex items-center justify-end border-t border-[#edf0eb] pt-4">
          <button disabled={pending} className="h-[40px] rounded-[10px] bg-[#244a35] px-5 text-[11px] font-bold text-white transition hover:bg-[#193d2a] disabled:opacity-50">{pending ? 'Importowanie…' : 'Importuj zestaw →'}</button>
        </div>
      </form>
    </div>
  </main>;
}
