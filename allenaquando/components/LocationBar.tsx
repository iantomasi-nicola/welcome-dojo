'use client';

import { useState } from 'react';
import type { Coordinates } from '@/lib/weather';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Props {
  coords: Coordinates;
  onChange: (coords: Coordinates) => void;
}

export default function LocationBar({ coords, onChange }: Props) {
  const { locate, locating, error } = useGeolocation();
  const [editing, setEditing] = useState(false);
  const [lat, setLat] = useState(String(coords.latitude));
  const [lon, setLon] = useState(String(coords.longitude));

  const applyManual = () => {
    const latitude = Number(lat);
    const longitude = Number(lon);
    if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      onChange({ latitude, longitude, label: 'Posizione manuale' });
      setEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-ink-800/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Posizione</p>
          <p className="text-sm font-medium text-slate-200">
            {coords.label ?? 'Posizione impostata'} · {coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => locate((c) => onChange(c))}
            disabled={locating}
            className="rounded-full bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/25 disabled:opacity-50"
          >
            {locating ? 'Localizzazione…' : '📍 Usa la mia posizione'}
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
          >
            ✏️ Coordinate manuali
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {editing && (
        <div className="mt-1 flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs text-slate-400">
            Latitudine
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-32 rounded-lg border border-white/10 bg-ink-900 px-2 py-1.5 text-sm text-white outline-none focus:border-sky-400"
            />
          </label>
          <label className="flex flex-col text-xs text-slate-400">
            Longitudine
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-32 rounded-lg border border-white/10 bg-ink-900 px-2 py-1.5 text-sm text-white outline-none focus:border-sky-400"
            />
          </label>
          <button
            onClick={applyManual}
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Applica
          </button>
        </div>
      )}
    </div>
  );
}
