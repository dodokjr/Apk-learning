import React from 'react';
import { Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import ForecastList from '../components/ForecastList';
import { ErrorView, LoadingView } from '../components/StatusViews';
import type { ForecastDay, Unit, Weather } from '../types';
import { formatTemp, iconForCondition, titleCase } from '../utils/weather';
import { formatTime } from '../utils/time';

interface Props {
  city: string;
  weather: Weather | null;
  forecast: ForecastDay[];
  unit: Unit;
  loading: boolean;
  weatherError: string | null;
  forecastError: string | null;
  updatedAt: Date | null;
  onRetry: () => void;
}

interface StatProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
}

function Stat({ icon, label, value }: StatProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 items-center">
      <View className="w-9 h-9 rounded-full bg-sky-500/15 items-center justify-center">
        <Feather name={icon} size={17} color={colors.accent} />
      </View>
      <Text className="text-slate-900 dark:text-white text-base font-semibold mt-2">{value}</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{label}</Text>
    </View>
  );
}

function CurrentWeather({
  weather,
  unit,
  updatedAt,
}: {
  weather: Weather;
  unit: Unit;
  updatedAt: Date | null;
}): React.JSX.Element {
  const { colors } = useTheme();
  const other: Unit = unit === 'C' ? 'F' : 'C';

  return (
    <View>
      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 items-center">
        <View className="flex-row items-center bg-sky-500/10 border border-sky-500/25 rounded-full px-3.5 py-1.5">
          <Feather name="map-pin" size={14} color={colors.accent} />
          <Text className="text-sky-800 dark:text-sky-100 text-base font-semibold ml-1.5">
            {titleCase(weather.city)}
          </Text>
        </View>

        <MaterialCommunityIcons
          name={iconForCondition(weather.condition)}
          size={104}
          color={colors.accent}
          style={{ marginTop: 18 }}
        />

        <Text className="text-slate-900 dark:text-white text-7xl font-extrabold mt-1">
          {formatTemp(weather.temp, unit)}
        </Text>
        {weather.temp !== undefined && (
          <Text className="text-slate-500 text-sm mt-1">= {formatTemp(weather.temp, other)}</Text>
        )}

        <View className="flex-row items-center mt-3">
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.muted} />
          <Text className="text-slate-600 dark:text-slate-300 text-base capitalize ml-1.5">
            {weather.condition ?? 'Kondisi tidak tersedia'}
          </Text>
        </View>

        {updatedAt && (
          <View className="flex-row items-center mt-4">
            <Feather name="refresh-cw" size={11} color={colors.inactive} />
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
        <Text className="text-amber-600 dark:text-amber-300/80 text-xs text-center mt-4 leading-5">
          Suhu belum terbaca dari respons API. Buka log terminal Expo dan cari baris "[API]" untuk
          melihat nama field yang dipakai.
        </Text>
      )}
    </View>
  );
}

export default function WeatherScreen({
  city,
  weather,
  forecast,
  unit,
  loading,
  weatherError,
  forecastError,
  updatedAt,
  onRetry,
}: Props): React.JSX.Element {
  if (loading && !weather && forecast.length === 0) {
    return <LoadingView label="Mengambil data cuaca..." />;
  }

  return (
    <View>
      {weatherError ? (
        <ErrorView message={weatherError} onRetry={onRetry} />
      ) : weather ? (
        <CurrentWeather weather={weather} unit={unit} updatedAt={updatedAt} />
      ) : null}

      <View className="mt-6">
        <ForecastList
          city={weather?.city ?? city}
          forecast={forecast}
          unit={unit}
          error={forecastError}
          onRetry={onRetry}
        />
      </View>
    </View>
  );
}