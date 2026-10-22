import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { ForecastDay, Unit } from '../types';
import { formatDayLabel, formatDeg, iconForCondition, titleCase } from '../utils/weather';

interface Props {
  city: string;
  forecast: ForecastDay[];
  unit: Unit;
  error: string | null;
  onRetry: () => void;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center mb-3">
      <View className="w-10 h-10 rounded-xl bg-sky-500/15 items-center justify-center">
        <Feather name="calendar" size={18} color={colors.accent} />
      </View>
      <View className="ml-3">
        <Text className="text-slate-900 dark:text-white text-lg font-bold">{title}</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm">{subtitle}</Text>
      </View>
    </View>
  );
}

export default function ForecastList({
  city,
  forecast,
  unit,
  error,
  onRetry,
}: Props): React.JSX.Element {
  const { colors } = useTheme();

  const range = useMemo(() => {
    const lows = forecast.map((d) => d.tempMin ?? d.tempMax).filter((v): v is number => v !== undefined);
    const highs = forecast.map((d) => d.tempMax).filter((v): v is number => v !== undefined);
    if (!lows.length || !highs.length) return null;
    return { min: Math.min(...lows), max: Math.max(...highs) };
  }, [forecast]);

  if (error) {
    return (
      <View>
        <SectionHeader title="Prediksi cuaca" subtitle={titleCase(city)} />
        <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 flex-row items-center">
          <Feather name="alert-triangle" size={18} color={colors.sun} />
          <View className="flex-1 mx-3">
            <Text className="text-amber-700 dark:text-amber-200 text-xs font-semibold">
              Prediksi tidak tersedia
            </Text>
            <Text className="text-amber-700/80 dark:text-amber-200/80 text-xs mt-0.5">{error}</Text>
          </View>
          <TouchableOpacity className="bg-amber-500/20 px-3 py-1.5 rounded-lg" onPress={onRetry}>
            <Text className="text-amber-800 dark:text-amber-100 text-xs font-semibold">Coba lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (forecast.length === 0) {
    return (
      <View>
        <SectionHeader title="Prediksi cuaca" subtitle={titleCase(city)} />
        <Text className="text-slate-500 text-center text-sm py-4">
          Belum ada data prediksi untuk {titleCase(city)}.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <SectionHeader title={`Prediksi ${forecast.length} hari`} subtitle={titleCase(city)} />

      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
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
              className={`flex-row items-center px-4 py-3.5 ${
                index > 0 ? 'border-t border-slate-200 dark:border-slate-800' : ''
              }`}
            >
              <View style={{ width: 88 }}>
                <Text className="text-slate-900 dark:text-white text-sm font-semibold capitalize">
                  {formatDayLabel(day.date, index)}
                </Text>
                {day.rainChance !== undefined && day.rainChance > 0 && (
                  <View className="flex-row items-center mt-0.5">
                    <Feather name="droplet" size={10} color={colors.accent} />
                    <Text className="text-sky-600 dark:text-sky-400 text-xs ml-1">
                      {Math.round(day.rainChance)}%
                    </Text>
                  </View>
                )}
              </View>

              <MaterialCommunityIcons
                name={iconForCondition(day.condition)}
                size={30}
                color={colors.accent}
              />

              <Text className="text-slate-500 dark:text-slate-400 text-xs ml-3 w-9 text-right">
                {formatDeg(low, unit)}
              </Text>
              <View className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-2.5 overflow-hidden">
                <View
                  className="h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full"
                  style={{ marginLeft: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                />
              </View>
              <Text className="text-slate-900 dark:text-white text-sm font-semibold w-9">
                {formatDeg(high, unit)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}