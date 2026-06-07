import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsTabs() {
  return (
    <Tabs
      safeAreaInsets={{ top: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
      }}>
      <Tabs.Screen
        name="tasa"
        options={{
          title: 'Tasa',
          tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Iva"
        options={{
          title: 'IVA',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
