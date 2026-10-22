import React from 'react';
import { View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export default function Logo(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 items-center justify-center">
      <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={colors.accent} />
      <View className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-950 border border-sky-500/40 items-center justify-center">
        <Feather name="clock" size={11} color={colors.accent} />
      </View>
    </View>
  );
}