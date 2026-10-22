import { useCallback, useEffect, useState } from 'react';
import { getForecast, getWeather } from '../service/api';
import type { ForecastDay, Weather } from '../types';

interface State {
  weather: Weather | null;
  forecast: ForecastDay[];
  weatherError: string | null;
  forecastError: string | null;
  loading: boolean;
  updatedAt: Date | null;
}

const messageOf = (reason: unknown): string =>
  reason instanceof Error ? reason.message : 'Terjadi kesalahan sistem.';

export function useWeatherData(city: string) {
  const [state, setState] = useState<State>({
    weather: null,
    forecast: [],
    weatherError: null,
    forecastError: null,
    loading: true,
    updatedAt: null,
  });
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    Promise.allSettled([getWeather(city), getForecast(city)]).then(([w, f]) => {
      if (cancelled) return;
      setState((prev) => ({
        weather: w.status === 'fulfilled' ? w.value : null,
        forecast: f.status === 'fulfilled' ? f.value : [],
        weatherError: w.status === 'rejected' ? messageOf(w.reason) : null,
        forecastError: f.status === 'rejected' ? messageOf(f.reason) : null,
        loading: false,
        updatedAt: w.status === 'fulfilled' || f.status === 'fulfilled' ? new Date() : prev.updatedAt,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [city, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}