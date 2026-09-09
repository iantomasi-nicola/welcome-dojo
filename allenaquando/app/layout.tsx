import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AllenaQuando — quando allenarti all’aperto',
  description:
    "AllenaQuando consiglia l'orario migliore per il calisthenics all'aperto nelle prossime 24 ore, incrociando 3 modelli meteo (ECMWF, ICON, GFS).",
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
