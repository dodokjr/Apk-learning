import React, { useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './global.css';

import { COLORS, DEFAULT_CITY } from './src/config';
import { useWeatherData } from './src/hooks/useWeatherData';
import Logo from './src/components/Logo';
import SearchBar from './src/components/SearchBar';
import TabBar from './src/components/TabBar';
import UnitToggle from './src/components/UnitToggle';
import WeatherScreen from './src/screens/WeatherScreen';
import ForecastScreen from './src/screens/ForecastScreen';
import TimeScreen from './src/screens/TimeScreen';
import type { TabKey, Unit } from './src/types';

export default function App(): React.JSX.Element {
  const [tab, setTab] = useState<TabKey>('weather');
  const [city, setCity] = useState<string>(DEFAULT_CITY);
  const [unit, setUnit] = useState<Unit>('C');
  const data = useWeatherData(city);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            tab === 'time' ? undefined : (
              <RefreshControl
                refreshing={data.loading && data.weather !== null}
                onRefresh={data.reload}
                tintColor={COLORS.accent}
                colors={[COLORS.accent]}
              />
            )
          }
        >
          <View className="flex-row items-center mb-5">
            <Logo />
            <View className="flex-1 ml-3.5">
              <Text className="text-white text-2xl font-extrabold">Cuaca & Waktu</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Cuaca, prediksi, dan jam dunia</Text>
            </View>
            {tab !== 'time' && <UnitToggle unit={unit} onChange={setUnit} />}
          </View>

          {tab !== 'time' && <SearchBar onSearch={setCity} />}

          {tab === 'weather' && (
            <WeatherScreen
              weather={data.weather}
              unit={unit}
              loading={data.loading}
              error={data.weatherError}
              updatedAt={data.updatedAt}
              onRetry={data.reload}
            />
          )}
          {tab === 'forecast' && (
            <ForecastScreen
              city={city}
              forecast={data.forecast}
              unit={unit}
              loading={data.loading}
              error={data.forecastError}
              onRetry={data.reload}
            />
          )}
          {tab === 'time' && <TimeScreen />}
        </ScrollView>

        <TabBar active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}