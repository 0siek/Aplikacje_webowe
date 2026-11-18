import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Słówka — małe porcje, wielkie postępy',
  description: 'Przyjazna aplikacja do nauki angielskich słówek i definicji.',
  applicationName: 'Słówka',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8faf8',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="pl" className="h-full antialiased"><body className="min-h-full">{children}</body></html>;
}
