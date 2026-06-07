import { getLocalIp } from './network.js';

const localIp = getLocalIp();
const isProduction = process.env.NODE_ENV === 'production';

export default {
  expo: {
    name: 'Color y Detalles',
    slug: 'color-y-detalles',
    scheme: 'color-y-detalles',
    version: '1.0.0',
    web: {
      favicon: './assets/favicon.png',
    },
    experiments: {
      tsconfigPaths: true,
    },
    plugins: ['expo-router', 'expo-secure-store'],
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#c1c1c1',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.colorydetalles.app',
      buildNumber: '1.0.0',
      infoPlist: {
        NSCameraUsageDescription: 'Para escanear códigos de barras',
        NSFaceIDUsageDescription: 'Para autenticar con Face ID',
      },
    },
    android: {
      softwareKeyboardLayoutMode: 'resize',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },

      permissions: ['USE_BIOMETRIC'],
      versionCode: 1,
      package: 'com.colorydetalles.app',
    },
    extra: {
      eas: {
        projectId: 'b851b01e-803d-4cca-94aa-41d9bd82b889',
      },
      apiUrl: isProduction ? 'https://colors-details-core-production.up.railway.app' : `http://${localIp}`,
    },
  },
};
