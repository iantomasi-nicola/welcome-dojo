'use client';

import { useCallback, useState } from 'react';
import type { Coordinates } from '@/lib/weather';

const STORAGE_KEY = 'allenaquando:coords';

export function loadStoredCoords(): Coordinates | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return parsed as Coordinates;
    }
  } catch {
    // ignore malformed/unavailable storage
  }
  return null;
}

export function storeCoords(coords: Coordinates) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // storage might be unavailable (private mode) — non-fatal
  }
}

export function useGeolocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((onSuccess: (coords: Coordinates) => void) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocalizzazione non supportata da questo browser.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'La tua posizione',
        });
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Permesso di geolocalizzazione negato.'
            : 'Impossibile ottenere la posizione.'
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
    );
  }, []);

  return { locate, locating, error };
}
