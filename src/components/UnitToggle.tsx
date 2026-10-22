import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { Unit } from '../types';

interface Props {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const OPTIONS: { value: Unit; label: string; hint: string }[] = [
  { value: 'C', label: '°C', hint: 'Celsius' },
  { value: 'F', label: '°F', hint: 'Fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: Props): React.JSX.Element {
  return (
    <View className="flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
      {OPTIONS.map((opt) => {
        const selected = opt.value === unit;
        return (
          <TouchableOpacity
            key={opt.value}
            accessibilityLabel={opt.hint}
            accessibilityState={{ selected }}
            className={`px-3 py-1.5 rounded-lg ${selected ? 'bg-sky-500' : ''}`}
            onPress={() => onChange(opt.value)}
          >
            <Text
              className={`text-sm font-bold ${
                selected ? 'text-sky-950' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}