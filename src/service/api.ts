import {
  API_TOKEN,
  BASE_URL,
  ENDPOINTS,
  TIME_ENDPOINTS,
  TIME_PREFIXES,
} from '../config';
import type { ForecastDay, TimeZoneItem, Weather } from '../types';
import { normalizeForecast, normalizeWeather, normalizeZones } from '../hooks/normalize';

function httpError(message: string, status?: number): Error {
  return Object.assign(new Error(message), { status });
}

async function requestUrl(path: string, url: string): Promise<unknown> {
  if (!API_TOKEN) {
    throw httpError('Access Token belum diatur. Isi EXPO_PUBLIC_API_TOKEN di file .env.');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });
  } catch {
    throw httpError('Tidak bisa terhubung ke server. Periksa koneksi internet kamu.');
  }

  if (response.status === 401 || response.status === 403) {
    throw httpError('Access Token tidak valid atau sudah kedaluwarsa.', response.status);
  }
  if (response.status === 404) {
    throw httpError(`Endpoint ${path} tidak ditemukan.`, 404);
  }
  if (!response.ok) {
    throw httpError(`Server mengembalikan error (${response.status}).`, response.status);
  }

  try {
    const json: unknown = await response.json();
    if (__DEV__) console.log(`[API] ${url}`, JSON.stringify(json));
    return json;
  } catch {
    throw httpError('Respons API bukan JSON yang valid.');
  }
}

function buildUrl(path: string, params: Record<string, string>, prefix = ''): string {
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${BASE_URL}${prefix}${path}${query ? `?${query}` : ''}`;
}

const request = (path: string, params: Record<string, string> = {}): Promise<unknown> =>
  requestUrl(path, buildUrl(path, params));

// Timer API: coba tiap prefix kalau hasilnya 404, lalu ingat prefix yang berhasil.
let workingTimePrefix: string | null = null;

async function requestTime(path: string): Promise<unknown> {
  const prefixes = workingTimePrefix === null ? TIME_PREFIXES : [workingTimePrefix];
  let lastError: unknown;

  for (const prefix of prefixes) {
    try {
      const json = await requestUrl(`${prefix}${path}`, buildUrl(path, {}, prefix));
      workingTimePrefix = prefix;
      return json;
    } catch (e) {
      lastError = e;
      const status = e instanceof Error && 'status' in e ? (e as { status?: number }).status : undefined;
      if (status !== 404) throw e;
    }
  }
  throw lastError;
}

export async function getWeather(city: string): Promise<Weather> {
  return normalizeWeather(await request(ENDPOINTS.weather, { city }), city);
}

export async function getForecast(city: string): Promise<ForecastDay[]> {
  return normalizeForecast(await request(ENDPOINTS.forecast, { city }));
}

export async function getWorldTimes(): Promise<TimeZoneItem[]> {
  return normalizeZones(await requestTime(TIME_ENDPOINTS.world));
}

export async function getCountryTimes(code: string): Promise<TimeZoneItem[]> {
  return normalizeZones(await requestTime(TIME_ENDPOINTS.country(code)));
}