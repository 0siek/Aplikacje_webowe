import { notFound } from 'next/navigation';
import { getDeck } from '@/actions/deckActions';
import DeckEditor from '@/components/DeckEditor';

export const instant = false;

export default async function EditDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const deck = await getDeck(deckId);
  if (!deck) notFound();
  return <DeckEditor deck={deck} isNew={false} />;
}
