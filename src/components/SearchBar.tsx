import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../config';

interface Props {
  onSearch: (city: string) => void;
}

export default function SearchBar({ onSearch }: Props): React.JSX.Element {
  const [text, setText] = useState<string>('');

  const submit = (): void => {
    const city = text.trim();
    if (city) onSearch(city);
  };

  return (
    <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl pl-4 pr-1.5 py-1.5 mb-5">
      <Feather name="map-pin" size={16} color={COLORS.muted} />
      <TextInput
        className="flex-1 text-white text-base px-3 py-2"
        placeholder="Cari kota, mis. Surabaya"
        placeholderTextColor="#64748b"
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        returnKeyType="search"
        autoCapitalize="words"
        autoCorrect={false}
      />
      <TouchableOpacity
        accessibilityLabel="Cari kota"
        className="bg-sky-500 active:bg-sky-600 w-10 h-10 rounded-xl items-center justify-center"
        onPress={submit}
      >
        <Feather name="search" size={18} color="#082f49" />
      </TouchableOpacity>
    </View>
  );
}