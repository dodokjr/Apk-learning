export const BASE_URL = 'https://api-mfikria.vercel.app';

// Weather API (router di-mount di /v2/weather).
// Semua endpoint butuh ?city=<nama> ATAU ?lat=<lat>&lon=<lon>.
export const ENDPOINTS = {
  weather: '/v2/weather', // cuaca saat ini
  forecast: '/v2/weather/forecast', // prediksi, opsional ?days=1-16&hours=0-168
  weatherStream: '/v2/weather/stream', // realtime SSE, diperbarui tiap 2 menit
} as const;

// Timer API. Dokumentasinya menulis path "/time/api/...". Aplikasi mencoba tiap
// prefix berikut secara berurutan (dipakai jika API dipasang di bawah /v2).
export const TIME_PREFIXES = ['/v2', ''] as const;

export const TIME_ENDPOINTS = {
  // World
  world: '/time/api/world', // kota utama dunia
  worldRegions: '/time/api/world/regions', // daftar region/benua
  worldZones: '/time/api/world/zones', // nama seluruh zona waktu
  worldAll: '/time/api/world/all', // semua zona, ?region=&search=&page=&limit=
  zone: (tz: string): string => `/time/api/world/zone?tz=${encodeURIComponent(tz)}`, // 1 zona, contoh: Asia/Jakarta
  worldStream: '/time/api/world/stream', // realtime SSE kota utama

  // Country (kode ISO: ID, US, JP, ...)
  countries: '/time/api/country', // daftar negara
  country: (code: string): string => `/time/api/country/zone?tz=${code}`, // semua zona 1 negara
  countryZone: (code: string, zone: string): string => `/time/api/country/${code}/${zone}`, // 1 zona, contoh: ID/WIB
  countryStream: (code: string): string => `/time/api/country/${code}/stream`, // realtime semua zona negara
} as const;

export const COUNTRY_CODE = 'Asia/Jakarta'; // dikirim ke TIME_ENDPOINTS.country() sebagai ?tz=
export const TIMEZONE = 'Asia/Jakarta'; // dipakai untuk TIME_ENDPOINTS.zone()

export const API_TOKEN: string = process.env.EXPO_PUBLIC_API_TOKEN ?? '';

export const DEFAULT_CITY = 'Jakarta';

export const COLORS = {
  bg: '#020617',
  card: '#0f172a',
  border: '#1e293b',
  accent: '#38bdf8',
  muted: '#94a3b8',
} as const;