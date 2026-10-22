import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, type Palette } from '../theme';
import type { TabKey } from '../types';

type IconName = React.ComponentProps<typeof Feather>['name'];

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'weather', label: 'Cuaca', icon: 'sun' },
  { key: 'time', label: 'Waktu', icon: 'clock' },
];

const PADDING = 6;
const BORDER = 1;
const ITEM_HEIGHT = 48;
const ACTIVE_COLOR = '#082f49'; // sky-950, kontras di atas indikator biru

const barShadow = (c: Palette): ViewStyle | undefined =>
  Platform.select<ViewStyle>({
    web: { boxShadow: `0 8px 24px ${c.shadow}` } as unknown as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
  });

const indicatorGlow = (c: Palette): ViewStyle | undefined =>
  Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 16px rgba(14,165,233,0.35)' } as unknown as ViewStyle,
    default: {
      shadowColor: c.indicator,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
  });

interface ItemProps {
  label: string;
  icon: IconName;
  selected: boolean;
  inactiveColor: string;
  onPress: () => void;
}

function TabItem({ label, icon, selected, inactiveColor, onPress }: ItemProps): React.JSX.Element {
  const progress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: selected ? 1 : 0,
      stiffness: 260,
      damping: 20,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [selected, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        height: ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed && !selected ? 0.6 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Feather name={icon} size={20} color={selected ? ACTIVE_COLOR : inactiveColor} />
        </Animated.View>
        {selected && (
          <Animated.Text
            numberOfLines={1}
            style={{
              opacity: progress,
              marginLeft: 6,
              fontSize: 13,
              fontWeight: '700',
              color: ACTIVE_COLOR,
            }}
          >
            {label}
          </Animated.Text>
        )}
      </View>
    </Pressable>
  );
}

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function TabBar({ active, onChange }: Props): React.JSX.Element {
  const { colors } = useTheme();
  const [barWidth, setBarWidth] = useState<number>(0);
  const x = useRef(new Animated.Value(0)).current;
  const placed = useRef<boolean>(false);

  const tabWidth = barWidth > 0 ? (barWidth - BORDER * 2 - PADDING * 2) / TABS.length : 0;
  const index = Math.max(0, TABS.findIndex((t) => t.key === active));

  useEffect(() => {
    if (tabWidth === 0) return;
    const toValue = index * tabWidth;
    if (!placed.current) {
      x.setValue(toValue); // posisi awal tanpa animasi
      placed.current = true;
      return;
    }
    Animated.spring(x, {
      toValue,
      stiffness: 240,
      damping: 22,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [index, tabWidth, x]);

  const onLayout = (e: LayoutChangeEvent): void => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: colors.bg,
      }}
    >
      <View
        accessibilityRole="tablist"
        onLayout={onLayout}
        style={[
          {
            flexDirection: 'row',
            padding: PADDING,
            borderRadius: 999,
            backgroundColor: colors.card,
            borderWidth: BORDER,
            borderColor: colors.border,
          },
          barShadow(colors),
        ]}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: PADDING,
                left: PADDING,
                width: tabWidth,
                height: ITEM_HEIGHT,
                borderRadius: 999,
                backgroundColor: colors.indicator,
                transform: [{ translateX: x }],
              },
              indicatorGlow(colors),
            ]}
          />
        )}

        {TABS.map((tab) => (
          <TabItem
            key={tab.key}
            label={tab.label}
            icon={tab.icon}
            selected={tab.key === active}
            inactiveColor={colors.inactive}
            onPress={() => onChange(tab.key)}
          />
        ))}
      </View>
    </View>
  );
}