import React, { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: ReactNode | ReactNode[];
  className?: string;
  variant?: CardVariant;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const variantClassNames: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-primary-dark shadow-lg shadow-slate-200/80',
  elevated: 'bg-white dark:bg-primary-dark shadow-2xl shadow-slate-300/90',
  outlined: 'bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 shadow-sm',
};

const AnimatedView = Animated.createAnimatedComponent(Animated.View);

const Card = ({
  children,
  className = '',
  variant = 'default',
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: CardProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 5,
    }).start();
  };

  const containerClassName = useMemo(
    () => `rounded-3xl p-6 ${variantClassNames[variant]} ${className}`.trim(),
    [className, variant]
  );

  if (!onPress && !onLongPress) {
    return (
      <AnimatedView
        className={containerClassName}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[{ opacity, transform: [{ scale }] }, style]}>
        {children}
      </AnimatedView>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      className="overflow-hidden rounded-3xl">
      <AnimatedView className={`overflow-hidden ${containerClassName}`} style={[{ opacity, transform: [{ scale }] }, style]}>
        {children}
      </AnimatedView>
    </Pressable>
  );
};

export default Card;
