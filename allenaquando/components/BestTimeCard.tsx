'use client';

import { motion } from 'framer-motion';
import { weatherEmoji, type HourForecast } from '@/lib/weather';

interface Props {
  hour: HourForecast | null;
  allExcluded: boolean;
}

export default function BestTimeCard({ hour, allExcluded }: Props) {
  if (!hour) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/60 to-ink-900 p-6 sm:p-8 shadow-glow"
      >
        <p className="text-sm font-medium uppercase tracking-wide text-red-300">Attenzione</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
          {allExcluded
            ? 'Nessuna finestra sicura nelle prossime 24 ore'
            : 'Dati non ancora disponibili'}
        </h2>
        <p className="mt-2 text-red-200/80">
          {allExcluded
            ? 'Rischio temporali o pioggia intensa per tutte le ore previste. Rimanda l’allenamento all’aperto.'
            : 'Imposta la tua posizione per vedere il momento migliore.'}
        </p>
      </motion.div>
    );
  }

  const emoji = weatherEmoji(hour.weathercode, hour.avgPrecipProbability);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/70 via-ink-900 to-ink-900 p-6 sm:p-8 shadow-glow"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
      <p className="text-sm font-medium uppercase tracking-wide text-sky-300">Il momento migliore</p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          {hour.dayLabel} alle {hour.hourLabel}
        </h2>
        <span className="text-4xl leading-none">{emoji}</span>
      </div>
      <p className="mt-3 max-w-xl text-base text-slate-200/90">
        {hour.reasons.length > 0 ? capitalize(hour.reasons.join(', ')) : 'Condizioni favorevoli.'}
        {hour.avgTemperature != null ? ` · ${Math.round(hour.avgTemperature)}°C` : ''}
      </p>
      <div className="mt-5 flex items-center gap-2">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
            style={{ width: `${hour.score}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-sky-200">Score {hour.score}/100</span>
      </div>
    </motion.div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
