# 🎴 YGO Probabilità

Web app single-page (Next.js + Tailwind CSS + Framer Motion + Recharts) per
calcolare la probabilità di pescare mani vive e mani morte in un mazzo di
Yu-Gi-Oh, usando la distribuzione **ipergeometrica multivariata** — calcolo
esatto, nessuna simulazione, tutto lato client.

## Funzionalità (MVP)

1. **Impostazioni mazzo**: numero di carte nel mazzo, carte in mano (con
   scorciatoie "Primo (5)" / "Secondo (6)"), carte pescate a turno.
2. **Gruppi di carte**: invece di inserire singole carte, si definiscono
   categorie funzionali (es. *Starter*, *Hand Trap*, *Board Breaker*) con il
   numero di copie nel mazzo. Le carte non assegnate a un gruppo sono
   trattate automaticamente come "altre carte".
3. **Condizione di mano viva** (builder AND/OR): si costruisce una
   condizione in forma normale disgiuntiva — una lista di clausole in OR,
   ognuna delle quali richiede un AND di soglie minime sui gruppi (es.
   *"almeno 1 Starter"* OPPURE *"almeno 1 Hand Trap E almeno 1 Board
   Breaker"*).
4. **Risultati**: probabilità di mano viva/morta sulla mano d'apertura, più
   un campo per provare un numero di pescate arbitrario (utile per stimare a
   metà partita).
5. **Curva nel tempo**: grafico della probabilità di mano viva/morta su 6
   turni successivi, dato il numero di pescate a turno impostato.

Il motore di calcolo (`lib/engine.ts` + `lib/combinatorics.ts`) enumera
esattamente la distribuzione congiunta sui gruppi referenziati dalla
condizione (in log-spazio per evitare overflow con mazzi fino a ~300 carte),
quindi non è un'approssimazione Monte Carlo.

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri http://localhost:3000.

## Deploy su Vercel

Dalla cartella `ygo-probabilita/`:

```bash
npx vercel --prod
```

Oppure, importando l'intero repository da dashboard Vercel, imposta
**Root Directory** = `ygo-probabilita` (Framework Preset: Next.js rilevato
automaticamente).

Nessuna variabile d'ambiente richiesta.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS (dark mode)
- Framer Motion (animazioni)
- Recharts (grafico curva probabilità)

## Roadmap (idee per iterazioni future)

- Import mazzo da file `.ydk`
- Simulazione Monte Carlo per condizioni troppo complesse da enumerare
- Simulatore di pesca interattivo con statistiche aggregate
- Grafico di sensitività (probabilità al variare delle copie di un gruppo)
- Confronto A/B tra due build di mazzo
- Configurazioni salvabili/condivisibili via URL
