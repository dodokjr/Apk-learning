import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Unit } from '../types';

export type WeatherIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function iconForCondition(condition?: string): WeatherIconName {
  const c = (condition ?? '').toLowerCase();
  if (/petir|badai|thunder|storm/.test(c)) return 'weather-lightning-rainy';
  if (/hujan lebat|heavy rain/.test(c)) return 'weather-pouring';
  if (/hujan|gerimis|rain|drizzle|shower/.test(c)) return 'weather-rainy';
  if (/salju|snow/.test(c)) return 'weather-snowy';
  if (/kabut|berkabut|fog|mist|haze|asap/.test(c)) return 'weather-fog';
  if (/cerah berawan|partly|few clouds|scattered/.test(c)) return 'weather-partly-cloudy';
  if (/berawan|mendung|cloud|overcast/.test(c)) return 'weather-cloudy';
  if (/cerah|clear|sun/.test(c)) return 'weather-sunny';
  return 'weather-partly-cloudy';
}

export const convertTemp = (celsius: number, unit: Unit): number =>
  unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;

// "29°C" atau "84°F"
export const formatTemp = (celsius: number | undefined, unit: Unit): string =>
  celsius === undefined ? '--' : `${Math.round(convertTemp(celsius, unit))}°${unit}`;

// "29°" (tanpa huruf satuan, untuk daftar prediksi)
export const formatDeg = (celsius: number | undefined, unit: Unit): string =>
  celsius === undefined ? '--' : `${Math.round(convertTemp(celsius, unit))}°`;

export const titleCase = (text: string): string =>
  text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export function formatDayLabel(date: Date | undefined, index: number): string {
  if (!date) return `Hari ${index + 1}`;
  const today = new Date();
  const diff = Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86_400_000
  );
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  return date.toLocaleDateString('id-ID', { weekday: 'long' });
}