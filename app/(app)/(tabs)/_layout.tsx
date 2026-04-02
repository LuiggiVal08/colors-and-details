import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Importamos la librería de iconos
export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="shopping"
      screenOptions={{
        headerShown: false,
        // tabBarActiveTintColor: '#0f172a',
        // tabBarInactiveTintColor: '#64748b',
      }}>
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
