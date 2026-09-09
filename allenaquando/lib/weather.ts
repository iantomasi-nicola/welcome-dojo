// Core domain logic: fetching Open-Meteo multi-model data, normalizing it and
// scoring each of the next 24 hours for outdoor calisthenics training.

// NOTE: Open-Meteo retired the legacy 0.4° "ecmwf_ifs04" model id in favor of
// the 0.25° "ecmwf_ifs025" feed. The old id is silently ignored by the API
// (no error, just an empty column for that model), which is why ECMWF used
// to show up blank in the chart/reliability panel — use the current id.
export const MODELS = ['ecmwf_ifs025', 'icon_seamless', 'gfs_seamless'] as const;
export type ModelId = (typeof MODELS)[number];

export const MODEL_LABELS: Record<ModelId, string> = {
  ecmwf_ifs025: 'ECMWF',
  icon_seamless: 'ICON',
  gfs_seamless: 'GFS',
};

// Colors used consistently across the chart, legend and reliability panel.
export const MODEL_COLORS: Record<ModelId, string> = {
  ecmwf_ifs025: '#38bdf8', // sky
  icon_seamless: '#a78bfa', // violet
  gfs_seamless: '#fb923c', // orange
};

const VARIABLES = [
  'precipitation_probability',
  'precipitation',
  'rain',
  'showers',
  'weathercode',
  'wind_speed_10m',
  'wind_gusts_10m',
  'cape',
  'temperature_2m',
] as const;

const STORM_CODES = new Set([95, 96, 99]);

export interface Coordinates {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface RawForecastResponse {
  latitude: number;
  longitude: number;
  timezone?: string;
  utc_offset_seconds?: number;
  hourly?: Record<string, Array<number | string | null>>;
  error?: boolean;
  reason?: string;
}

export interface ModelHourData {
  model: ModelId;
  precipitationProbability: number | null;
  precipitationProbabilityEstimated: boolean;
  precipitationMm: number | null;
  cape: number | null;
  weathercode: number | null;
  windGusts: number | null;
  windSpeed: number | null;
  temperature: number | null;
}

export interface HourForecast {
  time: string; // naive local ISO string as returned by Open-Meteo, e.g. 2026-09-09T14:00
  sortKey: number;
  hourLabel: string; // "14:00"
  dayLabel: string; // "oggi" | "domani" | "10/09"
  models: ModelHourData[];
  avgPrecipProbability: number | null;
  precipStdDev: number | null;
  maxCape: number | null;
  maxWindGusts: number | null;
  avgTemperature: number | null;
  weathercode: number | null;
  stormRisk: boolean;
  score: number;
  excluded: boolean;
  reasons: string[];
}

export function buildForecastUrl({ latitude, longitude }: Coordinates): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    hourly: VARIABLES.join(','),
    models: MODELS.join(','),
    timezone: 'auto',
    forecast_days: '2',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export async function fetchForecast(coords: Coordinates): Promise<RawForecastResponse> {
  const res = await fetch(buildForecastUrl(coords));
  const data: RawForecastResponse = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.reason || 'Impossibile recuperare le previsioni meteo.');
  }
  return data;
}

function getSeries(
  hourly: Record<string, Array<number | string | null>>,
  variable: string,
  model: ModelId
): Array<number | string | null> {
  return hourly[`${variable}_${model}`] ?? hourly[variable] ?? [];
}

function asNumber(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
}

// When a model doesn't expose precipitation_probability directly (some
// deterministic models don't), approximate it from the forecast precipitation
// amount so the three-model comparison always has something to compare.
function estimateProbabilityFromPrecip(mm: number): number {
  if (mm <= 0) return 0;
  return Math.min(100, Math.round(Math.sqrt(mm / 0.1) * 22));
}

function dayLabelFor(dateStr: string, nowShiftedMs: number): string {
  const hourMs = Date.parse(`${dateStr}:00Z`);
  const todayShifted = new Date(nowShiftedMs);
  const target = new Date(hourMs);
  const sameDay = todayShifted.getUTCFullYear() === target.getUTCFullYear() &&
    todayShifted.getUTCMonth() === target.getUTCMonth() &&
    todayShifted.getUTCDate() === target.getUTCDate();
  if (sameDay) return 'oggi';
  const tomorrow = new Date(todayShifted.getTime() + 86400000);
  const isTomorrow = tomorrow.getUTCFullYear() === target.getUTCFullYear() &&
    tomorrow.getUTCMonth() === target.getUTCMonth() &&
    tomorrow.getUTCDate() === target.getUTCDate();
  if (isTomorrow) return 'domani';
  return `${String(target.getUTCDate()).padStart(2, '0')}/${String(target.getUTCMonth() + 1).padStart(2, '0')}`;
}

interface ScoreInput {
  avgPrecipProbability: number | null;
  maxWindGusts: number | null;
  avgTemperature: number | null;
  stormRisk: boolean;
  maxCape: number | null;
}

function computeScore(input: ScoreInput): { score: number; excluded: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (input.stormRisk) {
    reasons.push(
      input.maxCape != null && input.maxCape > 1000
        ? `rischio temporali elevato (CAPE ${Math.round(input.maxCape)} J/kg)`
        : 'temporale segnalato dal bollettino meteo'
    );
    return { score: 0, excluded: true, reasons };
  }

  let score = 100;

  const prob = input.avgPrecipProbability ?? 0;
  if (prob > 50) {
    score -= 40 + (prob - 50) * 0.8;
    reasons.push(`probabilità di pioggia alta (${Math.round(prob)}%)`);
  } else if (prob > 20) {
    score -= (prob - 20) * 0.6;
    reasons.push(`probabilità di pioggia moderata (${Math.round(prob)}%)`);
  } else {
    reasons.push(`rischio pioggia basso (${Math.round(prob)}%)`);
  }

  const gusts = input.maxWindGusts ?? 0;
  if (gusts > 30) {
    score -= 15 + (gusts - 30) * 1.2;
    reasons.push(`raffiche di vento forti (${Math.round(gusts)} km/h)`);
  } else if (gusts > 0) {
    reasons.push('vento calmo');
  }

  const temp = input.avgTemperature;
  if (temp != null) {
    if (temp >= 15 && temp <= 25) {
      score += 10;
      reasons.push(`temperatura ideale (${Math.round(temp)}°C)`);
    } else if (temp > 30) {
      score -= 25;
      reasons.push(`troppo caldo (${Math.round(temp)}°C)`);
    } else if (temp < 5) {
      score -= 25;
      reasons.push(`troppo freddo (${Math.round(temp)}°C)`);
    } else if (temp > 25) {
      score -= (temp - 25) * 2;
      reasons.push(`temperatura sopra la media (${Math.round(temp)}°C)`);
    } else if (temp < 15) {
      score -= (15 - temp) * 1.5;
      reasons.push(`temperatura sotto la media (${Math.round(temp)}°C)`);
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, excluded: false, reasons };
}

/**
 * Parses the raw multi-model Open-Meteo response into per-hour forecasts,
 * scored for outdoor calisthenics, restricted to the next 24 hours from now
 * (in the *location's* local time, not the browser's).
 */
export function parseForecast(raw: RawForecastResponse): HourForecast[] {
  const hourly = raw.hourly;
  if (!hourly || !hourly.time) return [];

  const times = hourly.time as string[];
  const utcOffsetSeconds = raw.utc_offset_seconds ?? 0;
  // Open-Meteo returns naive local timestamps for the target location. To
  // compare "now" against them correctly regardless of the browser's own
  // timezone, shift the real UTC clock by the location's offset and treat
  // both sides as UTC — the deltas between them remain true elapsed time.
  const nowShiftedMs = Date.now() + utcOffsetSeconds * 1000;

  const hours: HourForecast[] = times.map((timeStr, i) => {
    const modelsData: ModelHourData[] = MODELS.map((model) => {
      const rawProb = asNumber(getSeries(hourly, 'precipitation_probability', model)[i]);
      const precipMm =
        asNumber(getSeries(hourly, 'precipitation', model)[i]) ??
        asNumber(getSeries(hourly, 'rain', model)[i]) ??
        asNumber(getSeries(hourly, 'showers', model)[i]);

      let probability = rawProb;
      let estimated = false;
      if (probability == null && precipMm != null) {
        probability = estimateProbabilityFromPrecip(precipMm);
        estimated = true;
      }

      return {
        model,
        precipitationProbability: probability,
        precipitationProbabilityEstimated: estimated,
        precipitationMm: precipMm,
        cape: asNumber(getSeries(hourly, 'cape', model)[i]),
        weathercode: asNumber(getSeries(hourly, 'weathercode', model)[i]),
        windGusts: asNumber(getSeries(hourly, 'wind_gusts_10m', model)[i]),
        windSpeed: asNumber(getSeries(hourly, 'wind_speed_10m', model)[i]),
        temperature: asNumber(getSeries(hourly, 'temperature_2m', model)[i]),
      };
    });

    const probs = modelsData
      .map((m) => m.precipitationProbability)
      .filter((v): v is number => v != null);
    const avgPrecipProbability = probs.length
      ? probs.reduce((a, b) => a + b, 0) / probs.length
      : null;
    const precipStdDev =
      probs.length > 1 && avgPrecipProbability != null
        ? Math.sqrt(
            probs.reduce((a, b) => a + (b - avgPrecipProbability) ** 2, 0) / probs.length
          )
        : probs.length === 1
        ? 0
        : null;

    const capes = modelsData.map((m) => m.cape).filter((v): v is number => v != null);
    const maxCape = capes.length ? Math.max(...capes) : null;

    const gusts = modelsData.map((m) => m.windGusts).filter((v): v is number => v != null);
    const maxWindGusts = gusts.length ? Math.max(...gusts) : null;

    const temps = modelsData.map((m) => m.temperature).filter((v): v is number => v != null);
    const avgTemperature = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;

    const codes = modelsData.map((m) => m.weathercode).filter((v): v is number => v != null);
    const stormFromCode = codes.some((c) => STORM_CODES.has(c));
    // Prefer the "worst" (most severe) code among models for the display icon,
    // since safety should win over optimism when models disagree.
    const weathercode = codes.length ? Math.max(...codes) : null;

    const stormRisk = (maxCape != null && maxCape > 1000) || stormFromCode;

    const { score, excluded, reasons } = computeScore({
      avgPrecipProbability,
      maxWindGusts,
      avgTemperature,
      stormRisk,
      maxCape,
    });

    const hourLabel = timeStr.slice(11, 16);

    return {
      time: timeStr,
      sortKey: Date.parse(`${timeStr}:00Z`),
      hourLabel,
      dayLabel: dayLabelFor(timeStr, nowShiftedMs),
      models: modelsData,
      avgPrecipProbability,
      precipStdDev,
      maxCape,
      maxWindGusts,
      avgTemperature,
      weathercode,
      stormRisk,
      score,
      excluded,
      reasons,
    };
  });

  return hours
    .filter((h) => h.sortKey >= nowShiftedMs - 3600_000 && h.sortKey <= nowShiftedMs + 24 * 3600_000)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, 24);
}

export function pickBestHour(hours: HourForecast[]): HourForecast | null {
  const candidates = hours.filter((h) => !h.excluded);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, h) => (h.score > best.score ? h : best), candidates[0]);
}

export type ReliabilityLevel = 'high' | 'medium' | 'low' | 'unknown';

export function reliabilityFor(stdDev: number | null): { level: ReliabilityLevel; label: string } {
  if (stdDev == null) return { level: 'unknown', label: 'Dati insufficienti per stimare l’affidabilità' };
  if (stdDev <= 10) return { level: 'high', label: 'Alta affidabilità — i modelli concordano' };
  if (stdDev <= 25) return { level: 'medium', label: 'Affidabilità media — lieve disaccordo tra i modelli' };
  return { level: 'low', label: 'Bassa affidabilità — i modelli divergono parecchio' };
}

export function weatherEmoji(code: number | null, precipProbability?: number | null): string {
  if (code == null) {
    if (precipProbability != null && precipProbability > 50) return '🌧️';
    return '🌤️';
  }
  if (STORM_CODES.has(code)) return '⛈️';
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67].includes(code)) return '🌧️';
  if ([71, 73, 75, 77].includes(code)) return '🌨️';
  if ([80, 81, 82].includes(code)) return '🌦️';
  if ([85, 86].includes(code)) return '🌨️';
  return '🌡️';
}

export function scoreColor(score: number, excluded: boolean): string {
  if (excluded) return '#ef4444'; // red-500
  if (score >= 70) return '#22c55e'; // green-500
  if (score >= 40) return '#eab308'; // yellow-500
  return '#f97316'; // orange-500
}
