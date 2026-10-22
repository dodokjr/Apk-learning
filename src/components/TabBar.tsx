import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../config';
import type { TabKey } from '../types';

const TABS: { key: TabKey; label: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { key: 'weather', label: 'Cuaca', icon: 'sun' },
  { key: 'forecast', label: 'Prediksi', icon: 'calendar' },
  { key: 'time', label: 'Waktu', icon: 'clock' },
];

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function TabBar({ active, onChange }: Props): React.JSX.Element {
  return (
    <View className="flex-row bg-slate-900 border-t border-slate-800 px-3 pt-2 pb-3">
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className="flex-1 items-center py-1.5"
            onPress={() => onChange(tab.key)}
          >
            <View className={`px-5 py-1.5 rounded-full ${selected ? 'bg-sky-500/15' : ''}`}>
              <Feather name={tab.icon} size={20} color={selected ? COLORS.accent : '#64748b'} />
            </View>
            <Text className={`text-xs mt-0.5 ${selected ? 'text-sky-400 font-semibold' : 'text-slate-500'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}