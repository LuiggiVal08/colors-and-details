import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
      }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="help"
        options={{ headerShown: true, title: 'Ayuda', animation: 'ios_from_right' }}
      />
      <Stack.Screen
        name="rescue"
        options={{ headerShown: true, title: 'Recuperar cuenta', animation: 'ios_from_right' }}
      />
    </Stack>
  );
}
