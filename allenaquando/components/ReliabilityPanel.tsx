'use client';

import { MODEL_COLORS, MODEL_LABELS, reliabilityFor, type HourForecast } from '@/lib/weather';

interface Props {
  hour: HourForecast | null;
}

const LEVEL_STYLES: Record<string, { badge: string; icon: string }> = {
  high: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: '✅' },
  medium: { badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', icon: '⚠️' },
  low: { badge: 'bg-red-500/15 text-red-300 border-red-500/30', icon: '❗' },
  unknown: { badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: '❔' },
};

export default function ReliabilityPanel({ hour }: Props) {
  if (!hour) return null;

  const { level, label } = reliabilityFor(hour.precipStdDev);
  const style = LEVEL_STYLES[level];

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-800/60 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Affidabilità previsione ({hour.dayLabel} {hour.hourLabel})
      </h3>
      <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${style.badge}`}>
        <span>{style.icon}</span>
        <span>{label}</span>
        {hour.precipStdDev != null && (
          <span className="text-xs opacity-70">(scarto ±{Math.round(hour.precipStdDev)}%)</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {hour.models.map((m) => (
          <div key={m.model} className="rounded-xl bg-ink-900/70 p-3 text-center">
            <div
              className="mx-auto mb-1 h-2 w-2 rounded-full"
              style={{ backgroundColor: MODEL_COLORS[m.model] }}
            />
            <p className="text-xs font-medium text-slate-400">{MODEL_LABELS[m.model]}</p>
            <p className="text-lg font-bold text-white">
              {m.precipitationProbability != null ? `${Math.round(m.precipitationProbability)}%` : '—'}
            </p>
            {m.precipitationProbabilityEstimated && (
              <p className="text-[10px] text-slate-500">stima</p>
            )}
          </div>
        ))}
      </div>
      {hour.maxCape != null && (
        <p className="mt-4 text-xs text-slate-400">
          CAPE massimo rilevato: <span className="font-semibold text-slate-200">{Math.round(hour.maxCape)} J/kg</span>
          {hour.maxCape > 1000 ? ' — rischio temporali significativo ⛈️' : ' — nessun rischio temporale rilevante'}
        </p>
      )}
    </section>
  );
}
