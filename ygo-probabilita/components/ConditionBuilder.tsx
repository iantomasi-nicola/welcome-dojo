'use client';

import type { CardGroup, Clause, Condition } from '@/lib/engine';

interface Props {
  title: string;
  hint?: string;
  groups: CardGroup[];
  condition: Condition;
  onChange: (condition: Condition) => void;
}

export default function ConditionBuilder({ title, hint, groups, condition, onChange }: Props) {
  const addClause = () => {
    const firstGroup = groups[0];
    const clause: Clause = firstGroup ? [{ groupId: firstGroup.id, min: 1 }] : [];
    onChange([...condition, clause]);
  };

  const removeClause = (clauseIndex: number) => {
    onChange(condition.filter((_, i) => i !== clauseIndex));
  };

  const addTerm = (clauseIndex: number) => {
    const firstGroup = groups[0];
    if (!firstGroup) return;
    onChange(
      condition.map((clause, i) =>
        i === clauseIndex ? [...clause, { groupId: firstGroup.id, min: 1 }] : clause
      )
    );
  };

  const updateTerm = (clauseIndex: number, termIndex: number, patch: { groupId?: string; min?: number }) => {
    onChange(
      condition.map((clause, i) =>
        i === clauseIndex
          ? clause.map((term, j) => (j === termIndex ? { ...term, ...patch } : term))
          : clause
      )
    );
  };

  const removeTerm = (clauseIndex: number, termIndex: number) => {
    onChange(
      condition.map((clause, i) => (i === clauseIndex ? clause.filter((_, j) => j !== termIndex) : clause))
    );
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
        <button
          type="button"
          onClick={addClause}
          disabled={groups.length === 0}
          className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-400 transition hover:bg-gold-500/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Clausola (OPPURE)
        </button>
      </div>
      {hint && <p className="mb-4 text-xs text-slate-500">{hint}</p>}

      {groups.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
          Definisci prima almeno un gruppo di carte.
        </p>
      )}

      <div className="space-y-3">
        {condition.map((clause, clauseIndex) => (
          <div key={clauseIndex}>
            {clauseIndex > 0 && (
              <div className="my-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                OPPURE
                <span className="h-px flex-1 bg-white/10" />
              </div>
            )}
            <div className="rounded-xl border border-white/5 bg-ink-800/50 p-3">
              <div className="space-y-2">
                {clause.map((term, termIndex) => (
                  <div key={termIndex} className="flex items-center gap-2">
                    {termIndex > 0 && (
                      <span className="w-7 shrink-0 text-center text-[10px] font-bold text-slate-500">
                        E
                      </span>
                    )}
                    {termIndex === 0 && <span className="w-7 shrink-0" />}
                    <span className="shrink-0 text-xs text-slate-400">almeno</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={term.min}
                      onChange={(e) =>
                        updateTerm(clauseIndex, termIndex, {
                          min: Math.max(1, parseInt(e.target.value, 10) || 1),
                        })
                      }
                      className="input-field w-14 shrink-0"
                    />
                    <select
                      value={term.groupId}
                      onChange={(e) => updateTerm(clauseIndex, termIndex, { groupId: e.target.value })}
                      className="input-field flex-1 min-w-0"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeTerm(clauseIndex, termIndex)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                      aria-label="Rimuovi condizione"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {clause.length === 0 && (
                  <p className="text-xs text-slate-500">Clausola vuota: non contribuisce mai.</p>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => addTerm(clauseIndex)}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                >
                  + carta (E)
                </button>
                <button
                  type="button"
                  onClick={() => removeClause(clauseIndex)}
                  className="text-xs text-slate-500 hover:text-red-300"
                >
                  rimuovi clausola
                </button>
              </div>
            </div>
          </div>
        ))}
        {condition.length === 0 && groups.length > 0 && (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
            Nessuna clausola: la probabilità sarà 0%. Aggiungine una.
          </p>
        )}
      </div>
    </section>
  );
}
