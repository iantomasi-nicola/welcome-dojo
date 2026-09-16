import type { CardGroup, Clause, Condition, DeckConfig } from './engine';

export const GROUP_COLORS = [
  '#facc15', // gold
  '#38bdf8', // sky
  '#34d399', // emerald
  '#fb7185', // rose
  '#a78bfa', // violet
  '#fb923c', // orange
  '#22d3ee', // cyan
  '#f472b6', // pink
];

export const DEFAULT_DECK: DeckConfig = {
  deckSize: 40,
  handSize: 5,
  drawsPerTurn: 1,
};

export const DEFAULT_GROUPS: CardGroup[] = [
  { id: 'starter', name: 'Starter', count: 9, color: GROUP_COLORS[0] },
  { id: 'hand-trap', name: 'Hand Trap', count: 6, color: GROUP_COLORS[1] },
  { id: 'board-breaker', name: 'Board Breaker', count: 4, color: GROUP_COLORS[3] },
];

const defaultClause: Clause = [{ groupId: 'starter', min: 1 }];
export const DEFAULT_CONDITION: Condition = [defaultClause];
