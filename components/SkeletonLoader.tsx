import { useEffect, useRef } from 'react';
import { Animated, View, useColorScheme, type ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  count?: number;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  variant?: 'text' | 'card';
  height?: number;
  className?: string;
}

const SkeletonLoader = ({
  count = 3,
  style,
  itemStyle,
  variant = 'card',
  height,
  className,
}: SkeletonLoaderProps) => {
  const opacity = useRef(new Animated.Value(0.6)).current;
  const colorScheme = useColorScheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  if (count === 1 && variant === 'card' && height) {
    return (
      <View className={`mb-4 overflow-hidden rounded-2xl bg-white p-4 dark:bg-primary-dark ${className || ''}`}>
        <Animated.View style={{ opacity }} className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <Animated.View style={{ opacity, height }} className="mt-4 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </View>
    );
  }

  return (
    <View style={[{ flexDirection: 'column' }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            {
              backgroundColor: colorScheme === 'dark' ? '#334155' : '#E2E8F0',
              borderRadius: 16,
              marginBottom: 12,
              height: variant === 'text' ? 18 : height ?? 110,
              width: '100%',
            },
            itemStyle,
            { opacity },
          ]}
        />
      ))}
    </View>
  );
};

export default SkeletonLoader;
