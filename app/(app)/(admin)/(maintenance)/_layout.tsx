import { Tabs } from 'expo-router';

export default function MaintenanceTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
      }}>
      <Tabs.Screen name="inventory" options={{ title: 'Inventario' }} />
      <Tabs.Screen name="database" options={{ title: 'Base de datos' }} />
    </Tabs>
  );
}
