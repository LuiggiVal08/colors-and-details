import React from 'react';
import { View, ImageBackground, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface ScreenLayoutProps {
  children: React.ReactNode;
  centerContent?: boolean;
}

const ScreenLayout = ({ children, centerContent = false }: ScreenLayoutProps) => {
  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      resizeMode="cover"
      className="absolute inset-0">
      <View className="absolute inset-0 bg-black/40" />

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        // PASAMOS EL CENTRADO AQUÍ:
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: centerContent ? 'center' : 'flex-start',
        }}
        // Quitamos el className que causaba el error
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* El flex-1 aquí permite que el contenido ocupe el espacio del flexGrow */}
          <View
            className={`w-full flex-1 items-center px-5 pt-5 ${
              centerContent ? 'justify-center' : 'justify-start'
            }`}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default ScreenLayout;
