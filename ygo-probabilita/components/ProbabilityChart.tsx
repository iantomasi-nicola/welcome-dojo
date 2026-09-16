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
import type { TurnPoint } from '@/lib/engine';

interface Props {
  points: TurnPoint[];
}

export default function ProbabilityChart({ points }: Props) {
  if (points.length === 0) return null;

  const data = points.map((p) => ({
    label: `T${p.turn}`,
    draws: p.draws,
    viva: Number((p.liveProbability * 100).toFixed(2)),
    morta: Number((p.deadProbability * 100).toFixed(2)),
  }));

  return (
    <section className="rounded-2xl border border-white/5 bg-ink-800/60 p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Probabilità nel tempo
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Come cambia la probabilità di mano viva/morta pescando turno dopo turno.
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
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
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: '#121729',
                border: '1px solid #ffffff1f',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number, name: string, item) => [
                `${value}%`,
                `${name === 'viva' ? 'Mano viva' : 'Mano morta'} · ${item.payload.draws} carte viste`,
              ]}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-slate-300">
                  {value === 'viva' ? 'Mano viva' : 'Mano morta'}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="viva"
              name="viva"
              stroke="#34d399"
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="morta"
              name="morta"
              stroke="#fb7185"
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
