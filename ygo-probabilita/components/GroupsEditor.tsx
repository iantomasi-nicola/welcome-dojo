'use client';

import { GROUP_COLORS } from '@/lib/defaults';
import type { CardGroup } from '@/lib/engine';
import { makeId } from '@/lib/id';

interface Props {
  groups: CardGroup[];
  deckSize: number;
  onChange: (groups: CardGroup[]) => void;
}

export default function GroupsEditor({ groups, deckSize, onChange }: Props) {
  const total = groups.reduce((sum, g) => sum + g.count, 0);
  const other = deckSize - total;

  const updateGroup = (id: string, patch: Partial<CardGroup>) => {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const removeGroup = (id: string) => onChange(groups.filter((g) => g.id !== id));

  const addGroup = () => {
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length];
    onChange([...groups, { id: makeId('group'), name: 'Nuovo gruppo', count: 1, color }]);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Gruppi di carte
        </h2>
        <button
          type="button"
          onClick={addGroup}
          className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-400 transition hover:bg-gold-500/25"
        >
          + Aggiungi gruppo
        </button>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-800/50 p-2.5"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: group.color }}
              aria-hidden
            />
            <input
              type="text"
              value={group.name}
              onChange={(e) => updateGroup(group.id, { name: e.target.value })}
              placeholder="Nome gruppo (es. Starter)"
              className="input-field flex-1 min-w-0"
            />
            <input
              type="number"
              min={0}
              max={deckSize}
              value={group.count}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                updateGroup(group.id, { count: Number.isNaN(n) ? 0 : Math.max(0, n) });
              }}
              className="input-field w-16 shrink-0"
              title="Copie nel mazzo"
            />
            <button
              type="button"
              onClick={() => removeGroup(group.id)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
              aria-label={`Rimuovi ${group.name}`}
            >
              ✕
            </button>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
            Nessun gruppo definito. Aggiungine uno per iniziare.
          </p>
        )}
      </div>

      <p className={`mt-3 text-xs ${other < 0 ? 'font-semibold text-red-400' : 'text-slate-500'}`}>
        {other < 0
          ? `⚠️ I gruppi contengono ${total} carte, ma il mazzo ne ha solo ${deckSize}.`
          : `${total} carte nei gruppi + ${other} altre carte = ${deckSize} carte nel mazzo.`}
      </p>
    </section>
  );
}
