'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import BestTimeCard from '@/components/BestTimeCard';
import HourlyTimeline from '@/components/HourlyTimeline';
import LocationBar from '@/components/LocationBar';
import ReliabilityPanel from '@/components/ReliabilityPanel';
import { useForecast } from '@/hooks/useForecast';
import { loadStoredCoords, storeCoords } from '@/hooks/useGeolocation';
import { pickBestHour, type Coordinates } from '@/lib/weather';

const RainProbabilityChart = dynamic(() => import('@/components/RainProbabilityChart'), {
  ssr: false,
});

const DEFAULT_COORDS: Coordinates = { latitude: 41.9028, longitude: 12.4964, label: 'Roma (predefinito)' };
const REFRESH_MS = 15 * 60 * 1000;

export default function Home() {
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredCoords();
    if (stored) setCoords(stored);
    setHydrated(true);
  }, []);

  const handleCoordsChange = (c: Coordinates) => {
    setCoords(c);
    storeCoords(c);
  };

  const { hours, isLoading, isValidating, error, refresh, fetchedAt } = useForecast(
    hydrated ? coords : null
  );

  const bestHour = useMemo(() => pickBestHour(hours), [hours]);
  const allExcluded = hours.length > 0 && hours.every((h) => h.excluded);

  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('');
  useEffect(() => {
    if (!fetchedAt) return;
    const update = () => {
      const mins = Math.max(0, Math.round((Date.now() - fetchedAt) / 60000));
      setLastUpdatedLabel(mins === 0 ? 'aggiornato ora' : `aggiornato ${mins} min fa`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [fetchedAt]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          🏋️ AllenaQuando
        </h1>
        <p className="text-sm text-slate-400">
          Il momento migliore per allenarti all&apos;aperto, incrociando 3 modelli meteo.
        </p>
      </header>

      <LocationBar coords={coords} onChange={handleCoordsChange} />

      {isLoading && <LoadingSkeleton />}

      {error && !isLoading && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5 text-center">
          <p className="text-sm font-medium text-red-300">
            ⚠️ Impossibile recuperare le previsioni meteo. {error.message}
          </p>
          <button
            onClick={() => refresh()}
            className="mt-3 rounded-full bg-red-500/20 px-4 py-1.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/30"
          >
            Riprova
          </button>
        </div>
      )}

      {!isLoading && !error && hours.length > 0 && (
        <>
          <BestTimeCard hour={bestHour} allExcluded={allExcluded} />
          <ReliabilityPanel hour={bestHour} />
          <RainProbabilityChart hours={hours} />
          <HourlyTimeline hours={hours} bestTime={bestHour?.time ?? null} />
        </>
      )}

      <footer className="mt-2 flex flex-col items-center gap-1 text-center text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{lastUpdatedLabel}</span>
          {isValidating && !isLoading && <span className="animate-pulseSoft">· aggiornamento…</span>}
          <button onClick={() => refresh()} className="underline decoration-dotted hover:text-slate-300">
            aggiorna ora
          </button>
        </div>
        <p>
          Dati meteo da{' '}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted hover:text-slate-300"
          >
            Open-Meteo
          </a>{' '}
          (ECMWF, ICON, GFS) · aggiornamento automatico ogni {REFRESH_MS / 60000} min
        </p>
      </footer>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-3xl bg-ink-800/60" />
      <div className="h-32 rounded-2xl bg-ink-800/60" />
      <div className="h-64 rounded-2xl bg-ink-800/60" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-24 shrink-0 rounded-2xl bg-ink-800/60" />
        ))}
      </div>
    </div>
  );
}
