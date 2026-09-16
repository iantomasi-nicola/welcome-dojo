'use client';

import type { DeckConfig } from '@/lib/engine';

interface Props {
  deck: DeckConfig;
  onChange: (deck: DeckConfig) => void;
}

export default function DeckSettings({ deck, onChange }: Props) {
  const update = (patch: Partial<DeckConfig>) => onChange({ ...deck, ...patch });

  return (
    <section className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Impostazioni mazzo
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Carte nel mazzo">
          <input
            type="number"
            min={1}
            max={300}
            value={deck.deckSize}
            onChange={(e) => update({ deckSize: clampInt(e.target.value, 1, 300) })}
            className="input-field"
          />
        </Field>

        <Field label="Carte in mano">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={deck.deckSize}
              value={deck.handSize}
              onChange={(e) => update({ handSize: clampInt(e.target.value, 0, deck.deckSize) })}
              className="input-field w-16"
            />
            <div className="flex gap-1">
              <QuickButton active={deck.handSize === 5} onClick={() => update({ handSize: 5 })}>
                Primo (5)
              </QuickButton>
              <QuickButton active={deck.handSize === 6} onClick={() => update({ handSize: 6 })}>
                Secondo (6)
              </QuickButton>
            </div>
          </div>
        </Field>

        <Field label="Pescate a turno">
          <input
            type="number"
            min={0}
            max={10}
            value={deck.drawsPerTurn}
            onChange={(e) => update({ drawsPerTurn: clampInt(e.target.value, 0, 10) })}
            className="input-field"
          />
        </Field>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function QuickButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? 'bg-gold-500/20 text-gold-400'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function clampInt(value: string, min: number, max: number): number {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
