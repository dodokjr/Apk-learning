import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../config';

type IconName = React.ComponentProps<typeof Feather>['name'];

interface Props {
  label?: string; // teks di bawah animasi
  icon?: IconName; // ikon di tengah (default: sun)
  size?: number; // diameter lingkaran tengah
  fullScreen?: boolean; // true = memenuhi layar dengan background gelap
}

const RIPPLE_MS = 1800;

export default function Loading({
  label = 'Memuat data…',
  icon = 'sun',
  size = 56,
  fullScreen = false,
}: Props): React.JSX.Element {
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeRipple = (v: Animated.Value): Animated.CompositeAnimation =>
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: RIPPLE_MS,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      );

    const animations = [
      makeRipple(ripple1),
      // riak kedua mulai setengah putaran kemudian, supaya bergelombang
      Animated.sequence([Animated.delay(RIPPLE_MS / 2), makeRipple(ripple2)]),
      // ikon berputar pelan
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      // lingkaran tengah dan label berdenyut
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [ripple1, ripple2, spin, pulse]);

  const ringStyle = (v: Animated.Value) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: COLORS.accent,
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
  });

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const coreScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const labelOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      style={
        fullScreen
          ? { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }
          : { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }
      }
    >
      <View style={{ width: size * 2.4, height: size * 2.4, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View pointerEvents="none" style={ringStyle(ripple1)} />
        <Animated.View pointerEvents="none" style={ringStyle(ripple2)} />

        <Animated.View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${COLORS.accent}26`,
            borderWidth: 1,
            borderColor: `${COLORS.accent}66`,
            transform: [{ scale: coreScale }],
          }}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name={icon} size={size * 0.45} color={COLORS.accent} />
          </Animated.View>
        </Animated.View>
      </View>

      {label ? (
        <Animated.Text
          style={{
            marginTop: 8,
            fontSize: 13,
            letterSpacing: 0.3,
            color: COLORS.muted,
            opacity: labelOpacity,
          }}
        >
          {label}
        </Animated.Text>
      ) : null}
    </View>
  );
}