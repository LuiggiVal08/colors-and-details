import React, { useMemo } from 'react';
import { View, ImageBackground, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
  centerContent?: boolean;
  scrollEnabled?: boolean;
  className?: string;
}

const ScreenLayout = ({ children, centerContent = false, scrollEnabled = true, className }: ScreenLayoutProps) => {
  const dismissGesture = useMemo(() => Gesture.Tap().onEnd(Keyboard.dismiss).runOnJS(true), []);

  const content = (
    <GestureDetector gesture={dismissGesture}>
      <View
        className={`relative w-full flex-1 items-center p-0 ${centerContent ? 'justify-center' : 'justify-start'} ${className || ''}`}>
        {children}
      </View>
    </GestureDetector>
  );

  const bg = (
    <ImageBackground source={require('../../assets/background.jpg')} resizeMode="cover" className="absolute inset-0">
      <View className="absolute inset-0 bg-black/40" />
    </ImageBackground>
  );

  if (!scrollEnabled) {
    return (
      <View className="flex-1">
        {bg}
        <SafeAreaView edges={['bottom']} className="flex-1">
          {content}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {bg}
      <SafeAreaView edges={['bottom']} className="flex-1">
        <KeyboardAwareScrollView
          bottomOffset={20}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: centerContent ? 'center' : 'flex-start',
          }}>
          {content}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ScreenLayout;
