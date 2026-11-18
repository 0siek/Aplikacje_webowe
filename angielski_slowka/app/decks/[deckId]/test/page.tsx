import { notFound } from 'next/navigation';
import { getDeck } from '@/actions/deckActions';
import StudySession from '@/components/StudySession';

export const instant = false;

export default async function TestPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const deck = await getDeck(deckId);
  if (!deck) notFound();
  return <StudySession deck={deck} initialMode="test" />;
}
