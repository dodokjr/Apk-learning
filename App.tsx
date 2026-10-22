import React, { useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './global.css';

import { DEFAULT_CITY } from './src/config';
import { useTheme } from './src/theme';
import { useWeatherData } from './src/hooks/useWeatherData';
import Logo from './src/components/Logo';
import SearchBar from './src/components/SearchBar';
import TabBar from './src/components/TabBar';
import ThemeToggle from './src/components/ThemeToggle';
import UnitToggle from './src/components/UnitToggle';
import WeatherScreen from './src/screens/WeatherScreen';
import TimeScreen from './src/screens/TimeScreen';
import type { TabKey, Unit } from './src/types';

export default function App(): React.JSX.Element {
  const { isDark, colors } = useTheme();
  const [tab, setTab] = useState<TabKey>('weather');
  const [city, setCity] = useState<string>(DEFAULT_CITY);
  const [unit, setUnit] = useState<Unit>('C');
  const data = useWeatherData(city);

  const isWeather = tab === 'weather';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.bg}
        />

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            isWeather ? (
              <RefreshControl
                refreshing={data.loading && (data.weather !== null || data.forecast.length > 0)}
                onRefresh={data.reload}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            ) : undefined
          }
        >
          <View className="flex-row items-center mb-5">
            <Logo />
            <View className="flex-1 mx-3.5">
              <Text className="text-slate-900 dark:text-white text-2xl font-extrabold">
                Cuaca & Waktu
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Cuaca, prediksi, dan jam dunia
              </Text>
            </View>
            <ThemeToggle />
          </View>

          {isWeather && (
            <View className="flex-row items-center mb-5">
              <View className="flex-1 mr-3">
                <SearchBar onSearch={setCity} />
              </View>
              <UnitToggle unit={unit} onChange={setUnit} />
            </View>
          )}

          {isWeather ? (
            <WeatherScreen
              city={city}
              weather={data.weather}
              forecast={data.forecast}
              unit={unit}
              loading={data.loading}
              weatherError={data.weatherError}
              forecastError={data.forecastError}
              updatedAt={data.updatedAt}
              onRetry={data.reload}
            />
          ) : (
            <TimeScreen />
          )}
        </ScrollView>

        <TabBar active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}