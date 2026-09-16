import { logChoose, clampProbability } from './combinatorics';

export interface CardGroup {
  id: string;
  name: string;
  /** Copie di questa carta/categoria presenti nel mazzo. */
  count: number;
  color: string;
}

/** Un termine di una clausola: "almeno `min` copie del gruppo `groupId`". */
export interface ClauseTerm {
  groupId: string;
  min: number;
}

/** Una clausola è un AND di termini. Una condizione è un OR di clausole (forma DNF). */
export type Clause = ClauseTerm[];
export type Condition = Clause[];

export interface DeckConfig {
  deckSize: number;
  handSize: number;
  drawsPerTurn: number;
}

function clauseSatisfied(clause: Clause, draw: Record<string, number>): boolean {
  return clause.every((term) => (draw[term.groupId] ?? 0) >= term.min);
}

export function conditionSatisfied(condition: Condition, draw: Record<string, number>): boolean {
  if (condition.length === 0) return false;
  return condition.some((clause) => clauseSatisfied(clause, draw));
}

/**
 * Calcola P(condizione soddisfatta) pescando `n` carte da un mazzo di `deckSize`,
 * enumerando esattamente la distribuzione ipergeometrica multivariata sui gruppi
 * referenziati dalla condizione. Le carte non referenziate vengono trattate come
 * un unico pool "altro".
 */
export function computeConditionProbability(
  deckSize: number,
  groups: CardGroup[],
  n: number,
  condition: Condition
): number {
  const referencedIds = Array.from(
    new Set(condition.flatMap((clause) => clause.map((term) => term.groupId)))
  );
  const referenced = referencedIds
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is CardGroup => !!g && g.count > 0);

  if (referenced.length === 0 || n <= 0) return 0;

  const referencedTotal = referenced.reduce((sum, g) => sum + g.count, 0);
  const other = deckSize - referencedTotal;
  if (other < 0) return NaN; // config inconsistente: gruppi più grandi del mazzo

  const logTotal = logChoose(deckSize, n);
  if (logTotal === -Infinity) return 0;

  let probability = 0;
  const draw: Record<string, number> = {};

  // Enumerazione ricorsiva con potatura: appena la somma parziale supera n si interrompe il ramo.
  function recurse(index: number, remaining: number, logProductSoFar: number) {
    if (index === referenced.length) {
      const otherDrawn = remaining;
      const logOther = logChoose(other, otherDrawn);
      if (logOther === -Infinity) return;
      const logP = logProductSoFar + logOther - logTotal;
      if (conditionSatisfied(condition, draw)) {
        probability += Math.exp(logP);
      }
      return;
    }

    const group = referenced[index];
    const kMax = Math.min(group.count, remaining);
    for (let k = 0; k <= kMax; k++) {
      const logC = logChoose(group.count, k);
      if (logC === -Infinity) continue;
      draw[group.id] = k;
      recurse(index + 1, remaining - k, logProductSoFar + logC);
    }
    delete draw[group.id];
  }

  recurse(0, n, 0);
  return clampProbability(probability);
}

/** Numero di carte visibili al turno `turn` (1-indexed), dato mano iniziale e pescate/turno. */
export function drawsAtTurn(deck: DeckConfig, turn: number): number {
  return deck.handSize + Math.max(0, turn - 1) * deck.drawsPerTurn;
}

export interface TurnPoint {
  turn: number;
  draws: number;
  liveProbability: number;
  deadProbability: number;
}

export function computeProbabilityCurve(
  deck: DeckConfig,
  groups: CardGroup[],
  liveCondition: Condition,
  turns: number
): TurnPoint[] {
  const points: TurnPoint[] = [];
  for (let turn = 1; turn <= turns; turn++) {
    const n = Math.min(deck.deckSize, drawsAtTurn(deck, turn));
    const live = computeConditionProbability(deck.deckSize, groups, n, liveCondition);
    points.push({
      turn,
      draws: n,
      liveProbability: live,
      deadProbability: clampProbability(1 - live),
    });
  }
  return points;
}
