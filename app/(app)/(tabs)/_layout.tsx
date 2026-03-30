import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="shopping"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#64748b',
      }}>
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📦</Text>,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Más',
          tabBarIcon: ({ color }) => <Text style={{ color }}>⋯</Text>,
        }}
      />
    </Tabs>
  );
}
