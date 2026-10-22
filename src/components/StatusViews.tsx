import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../config';

export function LoadingView({ label }: { label: string }): React.JSX.Element {
  return (
    <View className="py-16 items-center">
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text className="text-slate-400 text-sm mt-4">{label}</Text>
    </View>
  );
}

interface ErrorProps {
  message: string;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: ErrorProps): React.JSX.Element {
  return (
    <View className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 items-center">
      <Feather name="alert-circle" size={28} color="#fb7185" />
      <Text className="text-rose-200 text-sm text-center mt-3 leading-5">{message}</Text>
      <TouchableOpacity
        className="mt-4 bg-rose-500/20 active:bg-rose-500/30 px-5 py-2.5 rounded-xl"
        onPress={onRetry}
      >
        <Text className="text-rose-100 font-semibold text-sm">Coba lagi</Text>
      </TouchableOpacity>
    </View>
  );
}