'use client';

import { useMemo, useState } from 'react';
import ConditionBuilder from '@/components/ConditionBuilder';
import DeckSettings from '@/components/DeckSettings';
import GroupsEditor from '@/components/GroupsEditor';
import ProbabilityChart from '@/components/ProbabilityChart';
import ResultsPanel from '@/components/ResultsPanel';
import { DEFAULT_CONDITION, DEFAULT_DECK, DEFAULT_GROUPS } from '@/lib/defaults';
import {
  computeConditionProbability,
  computeProbabilityCurve,
  type CardGroup,
  type Condition,
  type DeckConfig,
} from '@/lib/engine';

const TURNS_TO_SHOW = 6;

export default function Home() {
  const [deck, setDeck] = useState<DeckConfig>(DEFAULT_DECK);
  const [groups, setGroups] = useState<CardGroup[]>(DEFAULT_GROUPS);
  const [liveCondition, setLiveCondition] = useState<Condition>(DEFAULT_CONDITION);
  const [customDraws, setCustomDraws] = useState(DEFAULT_DECK.handSize);

  const handleGroupsChange = (next: CardGroup[]) => {
    setGroups(next);
    const validIds = new Set(next.map((g) => g.id));
    setLiveCondition((prev) => prev.map((clause) => clause.filter((term) => validIds.has(term.groupId))));
  };

  const invalidGroups = groups.reduce((sum, g) => sum + g.count, 0) > deck.deckSize;

  const liveProbability = useMemo(
    () =>
      invalidGroups
        ? 0
        : computeConditionProbability(deck.deckSize, groups, deck.handSize, liveCondition),
    [deck.deckSize, deck.handSize, groups, liveCondition, invalidGroups]
  );

  const customProbability = useMemo(
    () =>
      invalidGroups ? 0 : computeConditionProbability(deck.deckSize, groups, customDraws, liveCondition),
    [deck.deckSize, customDraws, groups, liveCondition, invalidGroups]
  );

  const turnPoints = useMemo(
    () => (invalidGroups ? [] : computeProbabilityCurve(deck, groups, liveCondition, TURNS_TO_SHOW)),
    [deck, groups, liveCondition, invalidGroups]
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          🎴 YGO Probabilità
        </h1>
        <p className="text-sm text-slate-400">
          Calcola la probabilità di mani vive e mani morte del tuo mazzo, pescata dopo pescata.
        </p>
      </header>

      <DeckSettings deck={deck} onChange={setDeck} />
      <GroupsEditor groups={groups} deckSize={deck.deckSize} onChange={handleGroupsChange} />
      <ConditionBuilder
        title="Condizione di mano viva"
        hint="Una mano è viva se soddisfa almeno una clausola (OPPURE). Ogni clausola richiede tutte le sue carte (E)."
        groups={groups}
        condition={liveCondition}
        onChange={setLiveCondition}
      />

      {invalidGroups ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5 text-center text-sm text-red-300">
          ⚠️ Correggi i gruppi di carte: il totale supera le carte nel mazzo.
        </div>
      ) : (
        <>
          <ResultsPanel
            deck={deck}
            liveProbability={liveProbability}
            customDraws={customDraws}
            onCustomDrawsChange={setCustomDraws}
            customProbability={customProbability}
          />
          <ProbabilityChart points={turnPoints} />
        </>
      )}

      <footer className="mt-2 text-center text-xs text-slate-500">
        Calcolo esatto con distribuzione ipergeometrica multivariata — tutto nel browser, nessun dato
        inviato altrove.
      </footer>
    </main>
  );
}
