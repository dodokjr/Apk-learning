export const BASE_URL = 'https://api-mfikria.vercel.app';

// Ubah path di sini kalau endpoint API berbeda.
export const ENDPOINTS = {
  weather: '/v2/weather',
  forecast: '/api/forecast',
} as const;

// Timer API. Dokumentasinya menulis path "/time/api/...". Aplikasi mencoba tiap
// prefix berikut secara berurutan (dipakai jika API dipasang di bawah /v2).
export const TIME_PREFIXES = ['/v2', ''] as const;

export const TIME_ENDPOINTS = {
  world: '/time/api/world', // kota utama dunia
  country: (code: string): string => `/time/api/country/zone?tz=${code}`, // semua zona 1 negara
} as const;

export const COUNTRY_CODE = 'Asia/Jakarta';

export const API_TOKEN: string = process.env.EXPO_PUBLIC_API_TOKEN ?? '';

export const DEFAULT_CITY = 'Jakarta';

export const COLORS = {
  bg: '#020617',
  card: '#0f172a',
  border: '#1e293b',
  accent: '#38bdf8',
  muted: '#94a3b8',
} as const;