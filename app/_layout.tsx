import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar, useColorScheme, View } from 'react-native';
import '@/global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { themeLight, themeDark } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 1. Tiempo de vida de los datos en "caché" (en milisegundos)
      staleTime: 1000 * 60 * 5, // 5 minutos: no volverá a pedir datos al server si pasaron menos de 5 min.

      // 2. Reintentos automáticos si falla la petición
      retry: 3, // Si el server falla, lo intenta 2 veces más antes de marcar error.

      // 3. Refrescar al recuperar conexión
      //   networkMode: 'online', // Solo intenta peticiones si hay internet.

      // 4. ¿Revalidar cuando el usuario vuelve a la app?
      refetchOnWindowFocus: false, // En Web es útil, en Mobile suele dar problemas, mejor dejarlo en false.
    },
    mutations: {
      // Aquí puedes configurar comportamiento global para los POST/PUT/DELETE
      retry: 0, // Normalmente no quieres que un login se reintente solo si falló.
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? themeDark : themeLight;

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? themeDark.colors.background : themeLight.colors.background}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <View className={colorScheme === 'dark' ? 'dark' : ''} style={{ flex: 1 }}>
              <PaperProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(app)" />
                  </Stack>
                </QueryClientProvider>
              </PaperProvider>
            </View>
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
