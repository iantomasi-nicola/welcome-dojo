# 🏋️ AllenaQuando

Web app single-page (Next.js 14 + Tailwind CSS + Framer Motion + Recharts) che
consiglia l'orario migliore per allenarti all'aperto (calisthenics) nelle
prossime 24 ore, incrociando le previsioni di **3 modelli meteo indipendenti**
(ECMWF, ICON, GFS) via [Open-Meteo](https://open-meteo.com) — nessuna API key
richiesta.

## Come funziona

1. **Posizione**: geolocalizzazione del browser o coordinate manuali.
2. **Dati meteo**: una singola chiamata a `api.open-meteo.com/v1/forecast` con
   `models=ecmwf_ifs04,icon_seamless,gfs_seamless` e le variabili orarie
   `precipitation_probability, precipitation, rain, showers, weathercode,
   wind_speed_10m, wind_gusts_10m, cape, temperature_2m`.
3. **Consensus score**: per ogni ora si calcola la deviazione standard della
   probabilità di pioggia tra i 3 modelli. Bassa varianza → alta affidabilità;
   alta varianza → previsione incerta (segnalata in UI).
4. **Rischio temporali**: se il CAPE massimo tra i modelli supera 1000 J/kg, o
   uno dei modelli riporta un codice meteo da temporale, l'ora viene esclusa
   (score 0, evidenziata in rosso).
5. **Scoring 0–100** per ogni ora: penalità per pioggia > 50%, penalità per
   raffiche > 30 km/h, bonus per temperatura 15–25 °C, penalità per
   temperature estreme (>30 °C o <5 °C). Le ore vengono ordinate dalla
   migliore alla peggiore e l'ora con lo score più alto (tra quelle non
   escluse) è la raccomandazione principale.

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri http://localhost:3000.

## Deploy su Vercel

Dalla cartella `allenaquando/`:

```bash
npx vercel --prod
```

Oppure, se importi l'intero repository da dashboard Vercel, imposta
**Root Directory** = `allenaquando` nelle impostazioni del progetto (Framework
Preset: Next.js viene rilevato automaticamente).

Nessuna variabile d'ambiente o API key è richiesta: Open-Meteo è pubblica e
gratuita.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (dark mode)
- SWR (fetch client-side, refresh automatico ogni 15 minuti)
- Framer Motion (animazioni)
- Recharts (grafico a linee multi-modello)
