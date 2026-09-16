'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { DeckConfig } from '@/lib/engine';

interface Props {
  deck: DeckConfig;
  liveProbability: number;
  customDraws: number;
  onCustomDrawsChange: (n: number) => void;
  customProbability: number;
}

export default function ResultsPanel({
  deck,
  liveProbability,
  customDraws,
  onCustomDrawsChange,
  customProbability,
}: Props) {
  const livePct = liveProbability * 100;
  const deadPct = 100 - livePct;
  const [showCustom, setShowCustom] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-900 p-6 shadow-glow sm:p-8"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
      <p className="text-sm font-medium uppercase tracking-wide text-gold-400">
        Mano d&apos;apertura ({deck.handSize} carte)
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatBlock label="Mano viva" value={livePct} tone="good" />
        <StatBlock label="Mano morta" value={deadPct} tone="bad" />
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          {showCustom ? '− nascondi' : '+ prova con un numero di pescate diverso'}
        </button>
        {showCustom && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/5 bg-ink-800/50 p-3">
            <span className="text-xs text-slate-400">Carte pescate</span>
            <input
              type="number"
              min={0}
              max={deck.deckSize}
              value={customDraws}
              onChange={(e) => onCustomDrawsChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="input-field w-20"
            />
            <span className="ml-auto text-lg font-bold text-white">
              {(customProbability * 100).toFixed(2)}%
            </span>
            <span className="text-xs text-slate-500">probabilità condizione</span>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function StatBlock({ label, value, tone }: { label: string; value: number; tone: 'good' | 'bad' }) {
  const color = tone === 'good' ? 'text-emerald-400' : 'text-rose-400';
  const barColor = tone === 'good' ? 'from-emerald-400 to-emerald-300' : 'from-rose-500 to-rose-400';
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold sm:text-4xl ${color}`}>{value.toFixed(2)}%</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
