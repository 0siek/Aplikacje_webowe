import Link from 'next/link';
import { BookOpen, FileUp, LogOut, Plus } from 'lucide-react';
import { signOut } from '@/actions/authActions';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AppHeader({ active }: { active?: 'decks' | 'import' }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Słówka — strona główna">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen className="size-[18px]" /></span>
          <span className="text-[17px] font-semibold tracking-tight">słówka<span className="text-primary">.</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Menu główne">
          <Link href="/#zestawy" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), active !== 'import' && 'text-foreground')}>
            Moje zestawy
          </Link>
          <Link href="/decks/import" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), active === 'import' && 'bg-accent text-accent-foreground')}>
            Import CSV
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/decks/import" aria-label="Importuj zestaw z pliku CSV" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'sm:hidden')}>
            <FileUp />
          </Link>
          <Link href="/decks/import" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'hidden sm:inline-flex')}><FileUp data-icon="inline-start" /> Importuj</Link>
          <Link href="/decks/new" className={buttonVariants({ size: 'sm' })}>
            <Plus data-icon="inline-start" /> <span className="hidden min-[420px]:inline">Nowy zestaw</span><span className="min-[420px]:hidden">Nowy</span>
          </Link>
          <form action={signOut} className="hidden sm:block">
            <Button type="submit" variant="ghost" size="sm">Wyloguj</Button>
          </form>
          <form action={signOut} className="sm:hidden"><Button type="submit" variant="ghost" size="icon" aria-label="Wyloguj"><LogOut /></Button></form>
        </div>
      </div>
    </header>
  );
}
