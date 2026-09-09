'use client';

import type { HourForecast } from '@/lib/weather';
import HourCard from './HourCard';

interface Props {
  hours: HourForecast[];
  bestTime: string | null;
}

export default function HourlyTimeline({ hours, bestTime }: Props) {
  if (hours.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Prossime 24 ore
      </h3>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {hours.map((hour, i) => (
          <HourCard key={hour.time} hour={hour} isBest={hour.time === bestTime} index={i} />
        ))}
      </div>
    </section>
  );
}
