'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MODELS, MODEL_COLORS, MODEL_LABELS, type HourForecast } from '@/lib/weather';

interface Props {
  hours: HourForecast[];
}

interface ChartRow {
  label: string;
  [key: string]: number | string | null;
}

export default function RainProbabilityChart({ hours }: Props) {
  if (hours.length === 0) return null;

  const data: ChartRow[] = hours.map((h) => {
    const row: ChartRow = { label: `${h.hourLabel}` };
    for (const model of MODELS) {
      const m = h.models.find((x) => x.model === model);
      row[model] = m?.precipitationProbability ?? null;
    }
    return row;
  });

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-800/60 p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Probabilità di pioggia per modello
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Dove le tre curve si sovrappongono, la previsione è più affidabile.
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              interval={2}
              tickLine={false}
              axisLine={{ stroke: '#ffffff1f' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={{ stroke: '#ffffff1f' }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: '#121729',
                border: '1px solid #ffffff1f',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => [
                typeof value === 'number' ? `${Math.round(value)}%` : 'n/d',
                MODEL_LABELS[name as keyof typeof MODEL_LABELS] ?? String(name),
              ]}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-slate-300">
                  {MODEL_LABELS[value as keyof typeof MODEL_LABELS] ?? value}
                </span>
              )}
            />
            {MODELS.map((model) => (
              <Line
                key={model}
                type="monotone"
                dataKey={model}
                name={model}
                stroke={MODEL_COLORS[model]}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
