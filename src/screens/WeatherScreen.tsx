import React from 'react';
import { Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../config';
import { ErrorView, LoadingView } from '../components/StatusViews';
import type { Unit, Weather } from '../types';
import { formatTemp, iconForCondition, titleCase } from '../utils/weather';
import { formatTime } from '../utils/time';

interface Props {
  weather: Weather | null;
  unit: Unit;
  loading: boolean;
  error: string | null;
  updatedAt: Date | null;
  onRetry: () => void;
}

interface StatProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
}

function Stat({ icon, label, value }: StatProps): React.JSX.Element {
  return (
    <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl py-4 items-center">
      <View className="w-9 h-9 rounded-full bg-sky-500/15 items-center justify-center">
        <Feather name={icon} size={17} color={COLORS.accent} />
      </View>
      <Text className="text-white text-base font-semibold mt-2">{value}</Text>
      <Text className="text-slate-400 text-xs mt-0.5">{label}</Text>
    </View>
  );
}

export default function WeatherScreen({
  weather,
  unit,
  loading,
  error,
  updatedAt,
  onRetry,
}: Props): React.JSX.Element {
  if (loading && !weather) return <LoadingView label="Mengambil data cuaca..." />;
  if (error) return <ErrorView message={error} onRetry={onRetry} />;
  if (!weather) return <LoadingView label="Menunggu data..." />;

  const other: Unit = unit === 'C' ? 'F' : 'C';

  return (
    <View>
      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center">
        <View className="flex-row items-center bg-sky-500/10 border border-sky-500/25 rounded-full px-3.5 py-1.5">
          <Feather name="map-pin" size={14} color={COLORS.accent} />
          <Text className="text-sky-100 text-base font-semibold ml-1.5">{titleCase(weather.city)}</Text>
        </View>

        <MaterialCommunityIcons
          name={iconForCondition(weather.condition)}
          size={104}
          color={COLORS.accent}
          style={{ marginTop: 18 }}
        />

        <Text className="text-white text-7xl font-extrabold mt-1">{formatTemp(weather.temp, unit)}</Text>
        {weather.temp !== undefined && (
          <Text className="text-slate-500 text-sm mt-1">
            = {formatTemp(weather.temp, other)}
          </Text>
        )}

        <View className="flex-row items-center mt-3">
          <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.muted} />
          <Text className="text-slate-300 text-base capitalize ml-1.5">
            {weather.condition ?? 'Kondisi tidak tersedia'}
          </Text>
        </View>

        {updatedAt && (
          <View className="flex-row items-center mt-4">
            <Feather name="refresh-cw" size={11} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1.5">Diperbarui {formatTime(updatedAt)}</Text>
          </View>
        )}
      </View>

      <View className="flex-row mt-3" style={{ gap: 12 }}>
        <Stat
          icon="droplet"
          label="Kelembapan"
          value={weather.humidity === undefined ? '--' : `${Math.round(weather.humidity)}%`}
        />
        <Stat
          icon="wind"
          label="Angin"
          value={weather.windSpeed === undefined ? '--' : `${Math.round(weather.windSpeed)} km/j`}
        />
        <Stat icon="thermometer" label="Terasa" value={formatTemp(weather.feelsLike, unit)} />
      </View>

      {weather.temp === undefined && (
        <Text className="text-amber-300/80 text-xs text-center mt-4 leading-5">
          Suhu belum terbaca dari respons API. Buka log terminal Expo dan cari baris "[API]" untuk
          melihat nama field yang dipakai.
        </Text>
      )}
    </View>
  );
}