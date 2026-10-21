import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { 
  Key, 
  Search, 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer, 
  Clock, 
  MapPin 
} from 'lucide-react-native';

const BASE_URL = 'https://api-mfikria.vercel.app';

interface WeatherData {
  city?: string;
  temp?: number;
  condition?: string;
  humidity?: number;
  wind_speed?: number;
  feels_like?: number;
}

export default function App(): React.JSX.Element {
  const [accessToken, setAccessToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [city, setCity] = useState<string>('Jakarta');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherData = async (targetCity: string, token: string): Promise<void> => {
    if (!token.trim()) {
      Alert.alert('Perhatian', 'Harap masukkan Access Token API terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/weather?city=${encodeURIComponent(targetCity)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error('Access Token tidak valid atau sudah kedaluwarsa.');
      }

      if (!response.ok) {
        throw new Error(`Gagal mengambil data cuaca (${response.status})`);
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);
      setCity(targetCity);
      setIsAuthenticated(true);
    } catch (error: any) {
      Alert.alert('Error API', error.message || 'Terjadi kesalahan sistem.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (): void => {
    if (searchQuery.trim() !== '') {
      fetchWeatherData(searchQuery.trim(), accessToken);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header App */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-white tracking-wide">
            Cuaca & Waktu App
          </Text>
          <Text className="text-xs text-sky-400 mt-1">
            API Integration: api-mfikria.vercel.app
          </Text>
        </View>

        {/* Access Token Card */}
        <View className="bg-slate-800 p-4 rounded-2xl mb-4 border border-slate-700">
          <View className="flex-row items-center mb-3">
            <Key size={18} color="#38bdf8" />
            <Text className="text-slate-100 font-semibold text-sm ml-2">
              Configuration & Access Token
            </Text>
          </View>
          
          <TextInput
            className="bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm mb-3 border border-slate-600"
            placeholder="Masukkan Access Token API..."
            placeholderTextColor="#94a3b8"
            value={accessToken}
            onChangeText={setAccessToken}
            secureTextEntry={true}
          />
          
          <TouchableOpacity
            className="bg-sky-600 active:bg-sky-700 py-3 rounded-xl items-center"
            onPress={() => fetchWeatherData(city, accessToken)}
          >
            <Text className="text-white font-bold text-sm">
              {isAuthenticated ? 'Update Token' : 'Verifikasi & Hubungkan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Clock Card */}
        <View className="bg-sky-500/10 border border-sky-500/30 p-5 rounded-2xl items-center mb-4">
          <View className="flex-row items-center mb-1">
            <Clock size={16} color="#38bdf8" />
            <Text className="text-sky-400 text-xs font-semibold ml-1.5 uppercase tracking-wider">
              Waktu Realtime
            </Text>
          </View>
          <Text className="text-4xl font-extrabold text-sky-400 tracking-wider my-1">
            {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
          </Text>
          <Text className="text-xs text-slate-400">
            {formatDate(currentTime)}
          </Text>
        </View>

        {/* Search Input */}
        <View className="flex-row mb-4">
          <TextInput
            className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm border border-slate-700 mr-2"
            placeholder="Cari Kota (contoh: Surabaya)"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            className="bg-sky-600 active:bg-sky-700 px-5 rounded-xl justify-center items-center"
            onPress={handleSearch}
          >
            <Search size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Weather Output */}
        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text className="text-slate-400 text-xs mt-3">Mengambil data dari API...</Text>
          </View>
        ) : weatherData ? (
          <View className="bg-slate-800 p-6 rounded-2xl items-center border border-slate-700">
            <View className="flex-row items-center mb-2">
              <MapPin size={18} color="#38bdf8" />
              <Text className="text-xl font-bold text-white ml-1.5">
                {weatherData.city || city}
              </Text>
            </View>

            <View className="my-2 items-center">
              <CloudSun size={56} color="#38bdf8" />
              <Text className="text-5xl font-extrabold text-sky-400 my-2">
                {weatherData.temp !== undefined ? `${weatherData.temp}°C` : '30°C'}
              </Text>
              <Text className="text-sm font-medium text-slate-300 capitalize">
                {weatherData.condition || 'Cerah Berawan'}
              </Text>
            </View>

            <View className="flex-row justify-between w-full border-t border-slate-700 pt-4 mt-4">
              <View className="items-center flex-1">
                <View className="flex-row items-center mb-1">
                  <Droplets size={14} color="#94a3b8" />
                  <Text className="text-[10px] text-slate-400 ml-1">Kelembapan</Text>
                </View>
                <Text className="text-xs font-semibold text-white">
                  {weatherData.humidity ? `${weatherData.humidity}%` : '75%'}
                </Text>
              </View>

              <View className="items-center flex-1 border-x border-slate-700">
                <View className="flex-row items-center mb-1">
                  <Wind size={14} color="#94a3b8" />
                  <Text className="text-[10px] text-slate-400 ml-1">Angin</Text>
                </View>
                <Text className="text-xs font-semibold text-white">
                  {weatherData.wind_speed ? `${weatherData.wind_speed} km/h` : '12 km/h'}
                </Text>
              </View>

              <View className="items-center flex-1">
                <View className="flex-row items-center mb-1">
                  <Thermometer size={14} color="#94a3b8" />
                  <Text className="text-[10px] text-slate-400 ml-1">Terasa Like</Text>
                </View>
                <Text className="text-xs font-semibold text-white">
                  {weatherData.feels_like ? `${weatherData.feels_like}°C` : '32°C'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text className="text-slate-500 text-center italic mt-6 text-xs">
            Masukkan Access Token yang valid di atas untuk memuat data cuaca.
          </Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}