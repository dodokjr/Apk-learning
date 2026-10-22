export interface Zone {
    label: string;
    city: string;
    timeZone: string;
  }
  
  export const INDONESIA_ZONES: Zone[] = [
    { label: 'WIB', city: 'Jakarta', timeZone: 'Asia/Jakarta' },
    { label: 'WITA', city: 'Makassar', timeZone: 'Asia/Makassar' },
    { label: 'WIT', city: 'Jayapura', timeZone: 'Asia/Jayapura' },
  ];
  
  export const WORLD_ZONES: Zone[] = [
    { label: 'GMT/BST', city: 'London', timeZone: 'Europe/London' },
    { label: 'GST', city: 'Dubai', timeZone: 'Asia/Dubai' },
    { label: 'SGT', city: 'Singapura', timeZone: 'Asia/Singapore' },
    { label: 'JST', city: 'Tokyo', timeZone: 'Asia/Tokyo' },
    { label: 'AET', city: 'Sydney', timeZone: 'Australia/Sydney' },
    { label: 'ET', city: 'New York', timeZone: 'America/New_York' },
  ];
  
  export const formatTime = (date: Date, timeZone?: string, withSeconds = false): string =>
    date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : {}),
      hour12: false,
      ...(timeZone ? { timeZone } : {}),
    });
  
  export const formatFullDate = (date: Date, timeZone?: string): string =>
    date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(timeZone ? { timeZone } : {}),
    });
  
  const dateKey = (date: Date, timeZone?: string): string =>
    date.toLocaleDateString('en-CA', timeZone ? { timeZone } : undefined);
  
  export function dayOffsetLabel(date: Date, timeZone: string): string {
    const here = dateKey(date);
    const there = dateKey(date, timeZone);
    if (here === there) return 'Hari yang sama';
    return there > here ? 'Besok' : 'Kemarin';
  }
  
  export function getHour(date: Date, timeZone?: string): number {
    const hour = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hourCycle: 'h23',
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
    return parseInt(hour, 10);
  }
  
  export function greeting(hour: number): string {
    if (hour >= 4 && hour < 11) return 'Selamat pagi';
    if (hour >= 11 && hour < 15) return 'Selamat siang';
    if (hour >= 15 && hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }
  
  // Singkatan zona yang lebih dikenal daripada "UTC+07:00".
  export const ZONE_ABBR: Record<string, string> = {
    'Asia/Jakarta': 'WIB',
    'Asia/Pontianak': 'WIB',
    'Asia/Makassar': 'WITA',
    'Asia/Jayapura': 'WIT',
    'Europe/London': 'GMT/BST',
    'Asia/Dubai': 'GST',
    'Asia/Singapore': 'SGT',
    'Asia/Tokyo': 'JST',
    'Australia/Sydney': 'AET',
    'America/New_York': 'ET',
  };