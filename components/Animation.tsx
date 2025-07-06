import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';



export default function PulseAnimation({ tempo, energy = 0.6 }: PulseProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const duration = Math.max(200, 60000 / tempo); 
    scale.value = withRepeat(
      withTiming(1.25, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true 
    );
  }, [tempo]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: `rgba(${100 + 155 * energy},${200 - 100 * energy},255,${0.6 + 0.4 * energy})`,
    shadowOpacity: 0.6 + 0.4 * energy,
    width: 40 + 40 * energy, 
    height: 40 + 40 * energy,
    borderRadius: (40 + 40 * energy) / 2,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulse, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  pulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,200,255,0.6)',
    shadowColor: '#00c8ff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 6,
  },
});
