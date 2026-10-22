import { useCallback } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';
import { useColorScheme } from 'nativewind';

export interface Palette {
  bg: string;
  card: string;
  border: string;
  accent: string; // ikon & aksen
  indicator: string; // indikator tab
  muted: string;
  inactive: string;
  placeholder: string;
  sun: string;
  moon: string;
  success: string;
  danger: string;
  shadow: string; // warna bayangan tab bar
}

export const DARK: Palette = {
  bg: '#020617',
  card: '#0f172a',
  border: '#1e293b',
  accent: '#38bdf8',
  indicator: '#38bdf8',
  muted: '#94a3b8',
  inactive: '#64748b',
  placeholder: '#64748b',
  sun: '#fbbf24',
  moon: '#a5b4fc',
  success: '#34d399',
  danger: '#fb7185',
  shadow: 'rgba(0,0,0,0.45)',
};

export const LIGHT: Palette = {
  bg: '#f1f5f9',
  card: '#ffffff',
  border: '#e2e8f0',
  accent: '#0284c7',
  indicator: '#0ea5e9',
  muted: '#64748b',
  inactive: '#64748b',
  placeholder: '#94a3b8',
  sun: '#d97706',
  moon: '#6366f1',
  success: '#059669',
  danger: '#e11d48',
  shadow: 'rgba(15,23,42,0.18)',
};

// Mengikuti tema sistem secara default, dan bisa diganti manual lewat toggle().
export function useTheme() {
  const system = useSystemScheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = (colorScheme ?? system ?? 'dark') === 'dark';

  const toggle = useCallback(() => {
    setColorScheme(isDark ? 'light' : 'dark');
  }, [isDark, setColorScheme]);

  return { isDark, colors: isDark ? DARK : LIGHT, toggle };
}