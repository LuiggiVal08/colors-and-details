import React from 'react';
import { View, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface ScreenLayoutProps {
  children: React.ReactNode;
  centerContent?: boolean;
  scrollEnabled?: boolean;
  className?: string;
}

const ScreenLayout = ({ children, centerContent = false, scrollEnabled = true, className }: ScreenLayoutProps) => {
  const content = (
    <View
      className={`relative w-full flex-1 items-center p-0 ${centerContent ? 'justify-center' : 'justify-start'} ${className || ''}`}>
      {children}
    </View>
  );

  if (!scrollEnabled) {
    return (
      <View className="absolute inset-0">
        <Image
          source={require('../../assets/background.jpg')}
          resizeMode="cover"
          className="absolute inset-0 h-full w-full"
        />
        <View className="absolute inset-0 bg-black/40" />
        {content}
      </View>
    );
  }

  return (
    <View className="absolute inset-0">
      <Image
        source={require('../../assets/background.jpg')}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />
      <View className="absolute inset-0 bg-black/40" />

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: centerContent ? 'center' : 'flex-start',
        }}>
        {content}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ScreenLayout;
