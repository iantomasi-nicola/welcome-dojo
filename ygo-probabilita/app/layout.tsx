import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YGO Probabilità — calcolatore di mani per Yu-Gi-Oh',
  description:
    'Calcola la probabilità di pescare starter, extender e mani morte nel tuo mazzo Yu-Gi-Oh, con curve su più turni.',
};

export const viewport: Viewport = {
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body className="min-h-screen bg-ink-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
