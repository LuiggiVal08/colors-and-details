import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, LayoutChangeEvent, Platform } from 'react-native';
import { Tooltip } from 'react-native-paper';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { impactLight } from '@/helpers/haptics';

interface ExpandableFABProps {
  icon?: React.ReactNode;
  label: string;
  onPress: () => void;
  delay?: number;
  bgColorClass?: string;
  tooltipText?: string;
}

const ExpandableFAB: React.FC<ExpandableFABProps> = ({
  icon,
  label,
  onPress,
  delay = 3000,
  bgColorClass = 'bg-[#4DB6AC]',
  tooltipText,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const textContainerWidth = useSharedValue(0);
  const [hasMeasured, setHasMeasured] = useState(false);

  const baseButtonWidth = 56;
  const paddingHorizontal = 20;

  const onTextLayout = (event: LayoutChangeEvent) => {
    if (!hasMeasured) {
      const { width } = event.nativeEvent.layout;
      textContainerWidth.value = baseButtonWidth + width + paddingHorizontal;
      setHasMeasured(true);
    }
  };

  useEffect(() => {
    if (hasMeasured && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, hasMeasured, isExpanded]);

  // 1. MEJORA: Lógica de pulsación (Expandir si está cerrado + Acción)
  const handlePress = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    impactLight();
    onPress();
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const targetWidth = hasMeasured ? textContainerWidth.value : baseButtonWidth * 2.5;
    return {
      width: withTiming(isExpanded ? targetWidth : baseButtonWidth, { duration: 450 }),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isExpanded ? 1 : 0, { duration: 350 }),
      transform: [{ translateX: withTiming(isExpanded ? 0 : -10, { duration: 350 }) }],
    };
  });

  return (
    // 2. MEJORA: Contenedor de sombra externo (evita recortes de overflow)
    <View style={styles.shadowContainer} className="absolute bottom-10 right-6">
      <Tooltip title={tooltipText || label}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          // 3. MEJORA: Accesibilidad
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? label : `Expandir ${label}`}>
          <Animated.View
            style={[animatedContainerStyle, { overflow: 'hidden' }]}
            className={`h-14 flex-row items-center rounded-full ${bgColorClass}`}>
            {/* Contenedor del Icono */}
            <View style={styles.iconContainer} className="items-center justify-center">
              {icon ? icon : <Text className="text-2xl font-bold text-white">?</Text>}
            </View>

            {/* Texto Animado */}
            <Animated.View
              style={[animatedTextStyle, styles.textWrapper, { opacity: hasMeasured ? animatedTextStyle.opacity : 0 }]}
              onLayout={onTextLayout}>
              <Text className="text-base font-bold text-white" numberOfLines={1}>
                {label}
              </Text>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Tooltip>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    // Sombra nativa para evitar problemas con overflow:hidden en el hijo
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    position: 'absolute',
    left: 0,
    zIndex: 2,
  },
  textWrapper: {
    position: 'absolute',
    left: 56,
    paddingRight: 20,
    zIndex: 1,
  },
});

export default ExpandableFAB;
