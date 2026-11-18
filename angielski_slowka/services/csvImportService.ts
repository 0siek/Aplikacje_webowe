import 'server-only';
import { CardType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type ParsedCard = { front: string; back: string; cardType: CardType };

function countDelimitersInFirstRecord(input: string, delimiter: string) {
  let quoted = false;
  let count = 0;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && (character === '\n' || character === '\r')) {
      break;
    } else if (!quoted && character === delimiter) {
      count += 1;
    }
  }
  return count;
}

function parseRecords(input: string, delimiter: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;
  const source = input.replace(/^\uFEFF/, '');

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      record.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      record.push(field);
      if (record.some((value) => value.trim())) records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('W pliku CSV brakuje zamykającego cudzysłowu.');
  record.push(field);
  if (record.some((value) => value.trim())) records.push(record);
  return records;
}

function readCardType(value: string | undefined, rowNumber: number): CardType {
  const normalized = value?.trim().toLocaleUpperCase('pl-PL') ?? '';
  if (!normalized || normalized === 'TRANSLATION' || normalized === 'TŁUMACZENIE' || normalized === 'TLUMACZENIE') {
    return CardType.TRANSLATION;
  }
  if (normalized === 'DEFINITION' || normalized === 'DEFINICJA') return CardType.DEFINITION;
  throw new Error(`Wiersz ${rowNumber}: typ musi mieć wartość TRANSLATION albo DEFINITION.`);
}

function parseCards(csv: string): ParsedCard[] {
  const semicolons = countDelimitersInFirstRecord(csv, ';');
  const commas = countDelimitersInFirstRecord(csv, ',');
  const delimiter = semicolons >= commas ? ';' : ',';
  const records = parseRecords(csv, delimiter);
  if (records.length < 2) throw new Error('CSV musi zawierać nagłówek i co najmniej jedną fiszkę.');

  const headers = records[0].map((header) => header.trim().toLocaleLowerCase('pl-PL'));
  const frontIndex = headers.indexOf('front');
  const backIndex = headers.indexOf('back');
  const typeIndex = headers.findIndex((header) => header === 'cardtype' || header === 'type');
  if (frontIndex < 0 || backIndex < 0) {
    throw new Error('Nagłówek musi zawierać kolumny front i back. Kolumna cardType jest opcjonalna.');
  }

  const cardRows = records.slice(1);
  if (cardRows.length > 1000) throw new Error('Jeden zestaw może zawierać maksymalnie 1000 fiszek.');

  return cardRows.map((row, index) => {
    const rowNumber = index + 2;
    const front = row[frontIndex]?.trim() ?? '';
    const back = row[backIndex]?.trim() ?? '';
    if (!front || !back) throw new Error(`Wiersz ${rowNumber}: uzupełnij kolumny front i back.`);
    if (front.length > 180) throw new Error(`Wiersz ${rowNumber}: słówko może mieć maksymalnie 180 znaków.`);
    if (back.length > 1000) throw new Error(`Wiersz ${rowNumber}: odpowiedź może mieć maksymalnie 1000 znaków.`);
    return { front, back, cardType: readCardType(typeIndex < 0 ? undefined : row[typeIndex], rowNumber) };
  });
}

export class CsvImportService {
  static async importDeck(input: { ownerId: string; title: string; description?: string; csv: string }) {
    const title = input.title.trim();
    const description = input.description?.trim() ?? '';
    if (!title) throw new Error('Podaj nazwę zestawu.');
    if (title.length > 90) throw new Error('Nazwa zestawu może mieć maksymalnie 90 znaków.');
    if (description.length > 240) throw new Error('Opis może mieć maksymalnie 240 znaków.');

    const cards = parseCards(input.csv);
    const deck = await prisma.deck.create({
      data: {
        ownerId: input.ownerId,
        title,
        description: description || null,
        cards: { create: cards.map((card) => ({
          front: card.front,
          back: card.back,
          cardType: card.cardType,
        })) },
      },
      select: { id: true },
    });
    return { deckId: deck.id, cardCount: cards.length };
  }
}
