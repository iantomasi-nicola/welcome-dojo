'use client';

import useSWR from 'swr';
import { fetchForecast, parseForecast, type Coordinates, type RawForecastResponse } from '@/lib/weather';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

async function fetcher(coords: Coordinates): Promise<RawForecastResponse> {
  return fetchForecast(coords);
}

export function useForecast(coords: Coordinates | null) {
  const key = coords ? ['forecast', coords.latitude.toFixed(3), coords.longitude.toFixed(3)] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => fetcher(coords as Coordinates),
    {
      refreshInterval: REFRESH_INTERVAL_MS,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60_000,
      errorRetryCount: 3,
    }
  );

  const hours = data ? parseForecast(data) : [];

  return {
    hours,
    isLoading,
    isValidating,
    error: error as Error | undefined,
    refresh: () => mutate(),
    fetchedAt: data ? Date.now() : null,
  };
}
