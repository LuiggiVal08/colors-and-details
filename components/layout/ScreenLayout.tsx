import React from 'react';
import {
  View,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface ScreenLayoutProps {
  children: React.ReactNode;
}

const ScreenLayout = ({ children }: ScreenLayoutProps) => {
  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      resizeMode="cover"
      style={StyleSheet.absoluteFillObject}>
      {/* Filtro oscuro opcional si quieres que el fondo sea tenue */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        // flexGrow: 1 permite que el contenido ocupe todo el alto y se pueda centrar
        contentContainerStyle={styles.scrollContent}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Crucial para el centrado vertical
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default ScreenLayout;
