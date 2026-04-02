import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
