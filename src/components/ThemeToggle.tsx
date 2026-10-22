import React from 'react';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';

export default function ThemeToggle(): React.JSX.Element {
  const { isDark, colors, toggle } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      onPress={toggle}
      className="w-11 h-11 rounded-full items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:opacity-70"
    >
      <Feather name={isDark ? 'sun' : 'moon'} size={19} color={colors.accent} />
    </Pressable>
  );
}