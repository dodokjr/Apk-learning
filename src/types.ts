export interface Weather {
    city: string;
    temp?: number; // selalu dalam Celsius
    feelsLike?: number; // selalu dalam Celsius
    humidity?: number;
    windSpeed?: number;
    condition?: string;
  }
  
  export interface ForecastDay {
    key: string;
    date?: Date;
    tempMin?: number; // Celsius
    tempMax?: number; // Celsius
    condition?: string;
    rainChance?: number;
  }
  
  export type TabKey = 'weather' | 'forecast' | 'time';
  export type Unit = 'C' | 'F';
  
  export interface TimeZoneItem {
    key: string;
    city: string;
    label?: string; // WIB, JST, UTC+07:00, ...
    timeZone?: string; // nama IANA, mis. Asia/Jakarta
    text?: string; // jam statis dari API kalau zona tidak bisa dihitung sendiri
    instant?: Date; // waktu absolut dari API (kalau ada), dipakai untuk sinkronisasi
  }