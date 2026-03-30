import { Tabs } from 'expo-router';

export default function SettingsTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
      }}>
      <Tabs.Screen name="general" options={{ title: 'General' }} />
      <Tabs.Screen name="account" options={{ title: 'Cuenta' }} />
      <Tabs.Screen name="service" options={{ title: 'Servicio' }} />
    </Tabs>
  );
}
