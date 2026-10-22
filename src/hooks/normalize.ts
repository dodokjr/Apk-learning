import type { ForecastDay, TimeZoneItem, Weather } from '../types';
import { ZONE_ABBR } from '../utils/time';

type Json = Record<string, unknown>;

const isObj = (v: unknown): v is Json =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const num = (v: unknown): number | undefined => {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v : undefined;

// Angka bisa langsung, atau dibungkus: { value: 29 }, { celsius: 29 }, { speed: 12 }
const numOrBox = (v: unknown): number | undefined =>
  num(v) ?? (isObj(v) ? num(v.celsius) ?? num(v.c) ?? num(v.value) ?? num(v.speed) : undefined);

const strOrBox = (v: unknown): string | undefined =>
  str(v) ?? (isObj(v) ? str(v.text) ?? str(v.description) ?? str(v.main) ?? str(v.label) : undefined);

function findNum(o: unknown, test: RegExp, depth = 0): number | undefined {
  if (!isObj(o) || depth > 3) return undefined;
  for (const [k, v] of Object.entries(o)) {
    if (test.test(k)) {
      const n = numOrBox(v);
      if (n !== undefined) return n;
    }
  }
  for (const v of Object.values(o)) {
    if (isObj(v)) {
      const n = findNum(v, test, depth + 1);
      if (n !== undefined) return n;
    }
  }
  return undefined;
}

function findStr(o: unknown, test: RegExp, depth = 0): string | undefined {
  if (!isObj(o) || depth > 3) return undefined;
  for (const [k, v] of Object.entries(o)) {
    if (test.test(k)) {
      const s = strOrBox(v);
      if (s !== undefined) return s;
    }
  }
  for (const v of Object.values(o)) {
    if (isObj(v)) {
      const s = findStr(v, test, depth + 1);
      if (s !== undefined) return s;
    }
  }
  return undefined;
}

const RE = {
  temp: /^(temp|temperature|suhu|temp_?c|temperature_?c|temp_?celsius|temperature_?celsius|temperature_?celcius|suhu_?c|current_?temp)$/i,
  feels: /feels|terasa|apparent|heat_?index/i,
  humidity: /humid|kelembap|kelembab/i,
  wind: /^(wind_?speed|windspeed|wind|angin|kecepatan_?angin|wind_?kph|wind_?kmh)$/i,
  condition: /^(condition|kondisi|description|deskripsi|weather|cuaca|summary|status|text)$/i,
  city: /^(city|kota|name|location|lokasi)$/i,
  tMax: /^(temp_?max|max|tmax|high|tinggi|suhu_?maks\w*|suhu_?max\w*|maxtemp\w*)$/i,
  tMin: /^(temp_?min|min|tmin|low|rendah|suhu_?min\w*|mintemp\w*)$/i,
  rain: /pop|chance|probab|peluang|rain_?prob/i,
};

const unwrap = (raw: unknown): unknown =>
  isObj(raw) && raw.data !== undefined && raw.data !== null ? raw.data : raw;

function toDate(v: unknown): Date | undefined {
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v);
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

export function normalizeWeather(raw: unknown, fallbackCity: string): Weather {
  const d = unwrap(raw);
  if (!isObj(d)) throw new Error('Format data cuaca dari API tidak dikenali.');

  const first = Array.isArray(d.weather) ? d.weather[0] : undefined;

  return {
    city: findStr(d, RE.city) ?? fallbackCity,
    temp: findNum(d, RE.temp),
    feelsLike: findNum(d, RE.feels),
    humidity: findNum(d, RE.humidity),
    windSpeed: findNum(d, RE.wind),
    condition: findStr(d, RE.condition) ?? (isObj(first) ? str(first.description) ?? str(first.main) : undefined),
  };
}

export function normalizeForecast(raw: unknown): ForecastDay[] {
  const d = unwrap(raw);
  let list: unknown[] | undefined;

  if (Array.isArray(d)) {
    list = d;
  } else if (isObj(d)) {
    list = ['forecast', 'prediksi', 'list', 'daily', 'days', 'data']
      .map((k) => d[k])
      .find((v): v is unknown[] => Array.isArray(v));
  }
  if (!list) throw new Error('Format data prediksi dari API tidak dikenali.');

  const items = list.filter(isObj).map((item, index): ForecastDay => {
    const first = Array.isArray(item.weather) ? item.weather[0] : undefined;
    const date = toDate(item.date ?? item.tanggal ?? item.dt ?? item.datetime ?? item.time ?? item.dt_txt);
    const pop = findNum(item, RE.rain);

    return {
      key: `${index}`,
      date,
      tempMax: findNum(item, RE.tMax) ?? findNum(item, RE.temp),
      tempMin: findNum(item, RE.tMin),
      condition:
        findStr(item, RE.condition) ?? (isObj(first) ? str(first.description) ?? str(first.main) : undefined),
      rainChance: pop === undefined ? undefined : pop <= 1 ? pop * 100 : pop,
    };
  });

  return groupByDay(items).slice(0, 7);
}

// Kalau API mengirim data per 3 jam, gabungkan jadi satu baris per hari.
function groupByDay(items: ForecastDay[]): ForecastDay[] {
  const groups = new Map<string, ForecastDay>();
  items.forEach((item, index) => {
    const k = item.date ? item.date.toLocaleDateString('en-CA') : `idx-${index}`;
    const existing = groups.get(k);
    if (!existing) {
      groups.set(k, { ...item, key: k });
      return;
    }
    const highs = [existing.tempMax, item.tempMax].filter((v): v is number => v !== undefined);
    const lows = [existing.tempMin, item.tempMin, existing.tempMax, item.tempMax].filter(
      (v): v is number => v !== undefined
    );
    existing.tempMax = highs.length ? Math.max(...highs) : undefined;
    existing.tempMin = lows.length ? Math.min(...lows) : undefined;
    existing.condition ??= item.condition;
    if (item.rainChance !== undefined) {
      existing.rainChance = Math.max(existing.rainChance ?? 0, item.rainChance);
    }
  });
  return [...groups.values()];
}

// ---------- Timer API (/time/api/...) ----------

// Hanya waktu yang punya penanda zona (Z / +07:00) atau unix yang dianggap waktu absolut.
function toInstant(v: unknown): Date | undefined {
  let d: Date | undefined;
  if (typeof v === 'number') {
    d = new Date(v < 1e12 ? v * 1000 : v);
  } else if (typeof v === 'string') {
    const t = v.trim();
    if (/^\d{9,13}$/.test(t)) {
      const n = Number(t);
      d = new Date(n < 1e12 ? n * 1000 : n);
    } else if (t.length >= 16 && /([zZ]|[+-]\d{2}:?\d{2})$/.test(t)) {
      d = new Date(t);
    }
  }
  if (!d || Number.isNaN(d.getTime())) return undefined;
  const year = d.getUTCFullYear();
  return year >= 2000 && year <= 2100 ? d : undefined;
}

function findInstant(o: unknown, depth = 0): Date | undefined {
  if (!isObj(o) || depth > 3) return undefined;
  const test = /^(datetime|date_?time|iso|iso_?string|utc_?datetime|utc|now|current_?time|timestamp|unix|unixtime|epoch|time|waktu|local_?time)$/i;
  for (const [k, v] of Object.entries(o)) {
    if (test.test(k)) {
      const d = toInstant(v);
      if (d) return d;
    }
  }
  for (const v of Object.values(o)) {
    if (isObj(v)) {
      const d = findInstant(v, depth + 1);
      if (d) return d;
    }
  }
  return undefined;
}

const validTimeZone = (tz: string | undefined): string | undefined => {
  if (!tz || !tz.includes('/')) return undefined;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return tz;
  } catch {
    return undefined;
  }
};

const cityFromZone = (tz: string): string =>
  (tz.split('/').pop() ?? tz).replace(/_/g, ' ');

function extractList(d: unknown): Json[] {
  if (Array.isArray(d)) return d.filter(isObj);
  if (!isObj(d)) return [];

  const arr = ['zones', 'timezones', 'cities', 'items', 'results', 'list', 'data']
    .map((k) => d[k])
    .find((v): v is unknown[] => Array.isArray(v));
  if (arr) return arr.filter(isObj);

  // Array objek di key lain, mis. "locations"
  const anyArr = Object.values(d).find(
    (v): v is unknown[] => Array.isArray(v) && v.length > 0 && v.every(isObj)
  );
  if (anyArr) return anyArr.filter(isObj);

  // Bentuk peta: { "Asia/Jakarta": {...}, "Asia/Tokyo": {...} } atau { WIB: {...} }
  const entries = Object.entries(d).filter(([, v]) => isObj(v)) as [string, Json][];
  if (entries.length > 0 && entries.length >= Object.keys(d).length / 2) {
    return entries.map(([key, v]) => ({ __key: key, ...v }));
  }

  // Satu objek zona saja
  return findInstant(d) ? [d] : [];
}

function normalizeZone(item: Json, index: number): TimeZoneItem {
  const keyHint = str(item.__key);
  const zoneField = findStr(item, /^(tz|timezone|time_?zone|zone_?name|iana|zone|zona|id)$/i);
  const timeZone = validTimeZone(zoneField) ?? validTimeZone(keyHint);

  const abbr =
    findStr(item, /^(abbr|abbreviation|short_?name|singkatan|zone_?abbr|code|kode)$/i) ??
    (zoneField && !zoneField.includes('/') && zoneField.length <= 6 ? zoneField : undefined) ??
    (keyHint && !keyHint.includes('/') && keyHint.length <= 6 ? keyHint : undefined);
  const offset = findStr(item, /^(utc_?offset|gmt_?offset|offset)$/i);

  const city =
    findStr(item, /^(city|kota|name|nama|label|display_?name|location)$/i) ??
    (timeZone ? cityFromZone(timeZone) : abbr ?? `Zona ${index + 1}`);

  return {
    key: timeZone ?? abbr ?? `${index}`,
    city,
    label: abbr ?? (timeZone ? ZONE_ABBR[timeZone] : undefined) ?? (offset ? `UTC${offset}` : undefined),
    timeZone,
    text: findStr(item, /^(time|waktu|jam|local_?time)$/i),
    instant: findInstant(item),
  };
}

export function normalizeZones(raw: unknown): TimeZoneItem[] {
  const list = extractList(unwrap(raw));
  if (list.length === 0) throw new Error('Format data waktu dari API tidak dikenali.');
  return list.map(normalizeZone);
}