import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../config';
import { useClock } from '../hooks/useClock';
import { useWorldTime, type SyncStatus } from '../hooks/useWorldTime';
import type { TimeZoneItem } from '../types';
import { dayOffsetLabel, formatFullDate, formatTime, getHour, greeting } from '../utils/time';

interface SyncProps {
  status: SyncStatus;
  error: string | null;
  syncedAt: Date | null;
  onRetry: () => void;
}

function SyncBadge({ status, error, syncedAt, onRetry }: SyncProps): React.JSX.Element {
  if (status === 'loading') {
    return (
      <View className="flex-row items-center justify-center mb-3">
        <ActivityIndicator size="small" color={COLORS.accent} />
        <Text className="text-slate-400 text-xs ml-2">Menyinkronkan dengan server...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 mb-3 flex-row items-center">
        <Feather name="alert-triangle" size={18} color="#fbbf24" />
        <View className="flex-1 mx-3">
          <Text className="text-amber-200 text-xs font-semibold">Memakai daftar zona bawaan</Text>
          <Text className="text-amber-200/80 text-xs mt-0.5">{error}</Text>
        </View>
        <TouchableOpacity className="bg-amber-500/20 px-3 py-1.5 rounded-lg" onPress={onRetry}>
          <Text className="text-amber-100 text-xs font-semibold">Coba lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-center mb-3">
      <Feather name="check-circle" size={13} color="#34d399" />
      <Text className="text-emerald-300 text-xs ml-1.5">
        Tersinkron dengan server{syncedAt ? ` · ${formatTime(syncedAt)}` : ''}
      </Text>
    </View>
  );
}

function ZoneRow({ zone, now, first }: { zone: TimeZoneItem; now: Date; first: boolean }): React.JSX.Element {
  const tz = zone.timeZone;
  const hour = tz ? getHour(now, tz) : getHour(now);
  const isDay = hour >= 6 && hour < 18;
  const detail = [zone.label, tz ? dayOffsetLabel(now, tz) : undefined].filter(Boolean).join(' · ');

  return (
    <View className={`flex-row items-center px-4 py-3.5 ${first ? '' : 'border-t border-slate-800'}`}>
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${isDay ? 'bg-amber-400/15' : 'bg-indigo-400/15'}`}
      >
        <Feather name={isDay ? 'sun' : 'moon'} size={18} color={isDay ? '#fbbf24' : '#a5b4fc'} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-white text-sm font-semibold">{zone.city}</Text>
        {detail !== '' && <Text className="text-slate-500 text-xs mt-0.5">{detail}</Text>}
      </View>
      <Text className="text-sky-400 text-xl font-bold" style={{ fontVariant: ['tabular-nums'] }}>
        {tz ? formatTime(now, tz) : zone.text ?? '--:--'}
      </Text>
    </View>
  );
}

interface GroupProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  zones: TimeZoneItem[];
  now: Date;
}

function ZoneGroup({ title, icon, zones, now }: GroupProps): React.JSX.Element {
  return (
    <View className="mt-5">
      <View className="flex-row items-center mb-2 ml-1">
        <Feather name={icon} size={14} color={COLORS.muted} />
        <Text className="text-slate-300 text-sm font-semibold ml-2">{title}</Text>
      </View>
      <View className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        {zones.map((zone, i) => (
          <ZoneRow key={`${zone.key}-${i}`} zone={zone} now={now} first={i === 0} />
        ))}
      </View>
    </View>
  );
}

export default function TimeScreen(): React.JSX.Element {
  const device = useClock();
  const sync = useWorldTime();
  const now = new Date(device.getTime() + sync.offsetMs);
  const hour = getHour(now);
  const isDay = hour >= 6 && hour < 18;

  return (
    <View>
      <SyncBadge status={sync.status} error={sync.error} syncedAt={sync.syncedAt} onRetry={sync.reload} />

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 items-center">
        <View className="flex-row items-center bg-sky-500/10 border border-sky-500/25 rounded-full px-3.5 py-1.5">
          <Feather name={isDay ? 'sun' : 'moon'} size={14} color={COLORS.accent} />
          <Text className="text-sky-100 text-sm font-semibold ml-1.5">{greeting(hour)}</Text>
        </View>
        <Text
          className="text-white text-6xl font-extrabold mt-4"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatTime(now, undefined, true)}
        </Text>
        <View className="flex-row items-center mt-2">
          <Feather name="calendar" size={13} color={COLORS.muted} />
          <Text className="text-slate-400 text-sm ml-1.5">{formatFullDate(now)}</Text>
        </View>
      </View>

      <ZoneGroup title="Indonesia" icon="map-pin" zones={sync.indonesia} now={now} />
      <ZoneGroup title="Dunia" icon="globe" zones={sync.world} now={now} />
    </View>
  );
}