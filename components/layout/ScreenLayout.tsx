import React from 'react';
import {
  View,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

const ScreenLayout = ({ children }: ScreenLayoutProps) => {
  return (
    // 1. El ImageBackground debe ser el padre absoluto para que no se "encoja"
    <ImageBackground
      source={require('../../assets/background.jpg')}
      resizeMode="cover"
      style={StyleSheet.absoluteFillObject} // Ocupa toda la pantalla sin importar el teclado
    >
      <KeyboardAwareScrollView
        // 2. bottomOffset añade un margen extra sobre el teclado para que el input no quede pegado
        bottomOffset={20}
        // 3. Importante para que el contenido se centre si hay poco espacio
        // contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            className="flex-1 items-center justify-center bg-black/40"
            style={{ paddingHorizontal: 10 }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default ScreenLayout;
