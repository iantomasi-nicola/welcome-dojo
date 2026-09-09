'use client';

import { motion } from 'framer-motion';
import { scoreColor, weatherEmoji, type HourForecast } from '@/lib/weather';

interface Props {
  hour: HourForecast;
  isBest: boolean;
  index: number;
}

export default function HourCard({ hour, isBest, index }: Props) {
  const color = scoreColor(hour.score, hour.excluded);
  const prob = hour.avgPrecipProbability != null ? Math.round(hour.avgPrecipProbability) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.5) }}
      className={`flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border px-3 py-4 ${
        isBest
          ? 'border-sky-400/60 bg-sky-500/10 shadow-glow'
          : 'border-white/5 bg-ink-800/60'
      }`}
    >
      <span className="text-[11px] font-medium text-slate-400">
        {hour.dayLabel === 'oggi' ? hour.hourLabel : `${hour.dayLabel} ${hour.hourLabel}`}
      </span>
      <span className="text-2xl">{weatherEmoji(hour.weathercode, hour.avgPrecipProbability)}</span>
      <span className="text-sm font-semibold text-white">
        {hour.avgTemperature != null ? `${Math.round(hour.avgTemperature)}°` : '—'}
      </span>
      <span className="flex items-center gap-1 text-[11px] text-sky-300">
        💧 {prob != null ? `${prob}%` : '—'}
      </span>
      {hour.stormRisk && <span className="text-[10px] font-semibold text-red-400">⛈️ temporale</span>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(hour.score, 4)}%`, backgroundColor: color }}
        />
      </div>
      {isBest && (
        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
          Top
        </span>
      )}
    </motion.div>
  );
}
