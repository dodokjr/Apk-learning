import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../config';
import { ErrorView, LoadingView } from '../components/StatusViews';
import type { ForecastDay, Unit } from '../types';
import { formatDayLabel, formatDeg, iconForCondition, titleCase } from '../utils/weather';

interface Props {
  city: string;
  forecast: ForecastDay[];
  unit: Unit;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function ForecastScreen({
  city,
  forecast,
  unit,
  loading,
  error,
  onRetry,
}: Props): React.JSX.Element {
  const range = useMemo(() => {
    const lows = forecast.map((d) => d.tempMin ?? d.tempMax).filter((v): v is number => v !== undefined);
    const highs = forecast.map((d) => d.tempMax).filter((v): v is number => v !== undefined);
    if (!lows.length || !highs.length) return null;
    return { min: Math.min(...lows), max: Math.max(...highs) };
  }, [forecast]);

  if (loading && forecast.length === 0) return <LoadingView label="Menyusun prediksi cuaca..." />;
  if (error) return <ErrorView message={error} onRetry={onRetry} />;
  if (forecast.length === 0) {
    return (
      <Text className="text-slate-500 text-center text-sm mt-8">
        Belum ada data prediksi untuk {titleCase(city)}.
      </Text>
    );
  }

  return (
    <View>
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-xl bg-sky-500/15 items-center justify-center">
          <Feather name="calendar" size={18} color={COLORS.accent} />
        </View>
        <View className="ml-3">
          <Text className="text-white text-lg font-bold">Prediksi {forecast.length} hari</Text>
          <Text className="text-slate-400 text-sm">{titleCase(city)}</Text>
        </View>
      </View>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {forecast.map((day, index) => {
          const low = day.tempMin ?? day.tempMax;
          const high = day.tempMax;
          let left = 0;
          let width = 100;
          if (range && low !== undefined && high !== undefined && range.max > range.min) {
            left = ((low - range.min) / (range.max - range.min)) * 100;
            width = Math.max(((high - low) / (range.max - range.min)) * 100, 8);
          }

          return (
            <View
              key={day.key}
              className={`flex-row items-center px-4 py-3.5 ${index > 0 ? 'border-t border-slate-800' : ''}`}
            >
              <View style={{ width: 88 }}>
                <Text className="text-white text-sm font-semibold capitalize">
                  {formatDayLabel(day.date, index)}
                </Text>
                {day.rainChance !== undefined && day.rainChance > 0 && (
                  <View className="flex-row items-center mt-0.5">
                    <Feather name="droplet" size={10} color={COLORS.accent} />
                    <Text className="text-sky-400 text-xs ml-1">{Math.round(day.rainChance)}%</Text>
                  </View>
                )}
              </View>

              <MaterialCommunityIcons
                name={iconForCondition(day.condition)}
                size={30}
                color={COLORS.accent}
              />

              <Text className="text-slate-400 text-xs ml-3 w-9 text-right">{formatDeg(low, unit)}</Text>
              <View className="flex-1 h-1.5 bg-slate-800 rounded-full mx-2.5 overflow-hidden">
                <View
                  className="h-1.5 bg-sky-400 rounded-full"
                  style={{ marginLeft: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                />
              </View>
              <Text className="text-white text-sm font-semibold w-9">{formatDeg(high, unit)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}