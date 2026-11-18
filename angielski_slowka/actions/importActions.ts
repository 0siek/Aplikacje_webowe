'use server';

import { revalidatePath } from 'next/cache';
import { CsvImportService } from '@/services/csvImportService';
import { requireCurrentUserId } from '@/lib/auth/server';

export type CsvImportState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; deckId: string; cardCount: number };

export async function importDeckFromCsv(_previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const ownerId = await requireCurrentUserId();
  if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    return { status: 'error', message: 'Import zestawów wymaga skonfigurowanej bazy PostgreSQL.' };
  }

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const entry = formData.get('file');
  if (!(entry instanceof File)) return { status: 'error', message: 'Wybierz plik CSV.' };
  if (!entry.name.toLocaleLowerCase('pl-PL').endsWith('.csv')) {
    return { status: 'error', message: 'Wybierz plik z rozszerzeniem .csv.' };
  }
  if (entry.size === 0) return { status: 'error', message: 'Wybrany plik jest pusty.' };
  if (entry.size > 512 * 1024) return { status: 'error', message: 'Plik CSV może mieć maksymalnie 512 KB.' };

  try {
    const result = await CsvImportService.importDeck({ ownerId, title, description, csv: await entry.text() });
    revalidatePath('/');
    revalidatePath(`/decks/${result.deckId}/edit`);
    return { status: 'success', ...result };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Nie udało się zaimportować zestawu.',
    };
  }
}
