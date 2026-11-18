'use client';

import React, { useState } from 'react';

interface Flashcard3DProps {
  front: string;
  back: string;
  cardType: string;
  onAnswer: (known: boolean) => void;
}

export default function Flashcard3D({ front, back, cardType, onAnswer }: Flashcard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleChoice = (known: boolean) => {
    setIsFlipped(false);
    onAnswer(known);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* 3D Flip Container */}
      <div 
        className="w-full h-72 md:h-96 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Przód fiszki */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col justify-between backface-hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
              {cardType === 'TRANSLATION' ? 'Słówko Angielskie' : 'Termin / Pojęcie'}
            </span>
            <div className="text-center text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
              {front}
            </div>
            <div className="text-center text-xs text-slate-400">Kliknij, aby odwrócić fiszkę</div>
          </div>

          {/* Tył fiszki */}
          <div className="absolute inset-0 w-full h-full bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between rotate-y-180 backface-hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
              {cardType === 'TRANSLATION' ? 'Tłumaczenie (PL)' : 'Definicja (EN)'}
            </span>
            <div className="text-center text-2xl md:text-3xl font-medium text-slate-800 dark:text-white">
              {back}
            </div>
            <div className="text-center text-xs text-slate-400">Stuknij, aby wrócić</div>
          </div>

        </div>
      </div>

      {/* Przyciski oceny (Znam / Powtórz) */}
      <div className="flex gap-4 mt-6 w-full max-w-md">
        <button
          onClick={(e) => { e.stopPropagation(); handleChoice(false); }}
          className="flex-1 py-4 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl transition shadow-sm active:scale-95 text-lg"
        >
          Powtórz ❌
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleChoice(true); }}
          className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm active:scale-95 text-lg"
        >
          Znam ✅
        </button>
      </div>
    </div>
  );
}