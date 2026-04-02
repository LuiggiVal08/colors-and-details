import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Importamos la librería de iconos
export default function SettingsTabs() {
  return (
    <Tabs
      safeAreaInsets={{ top: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
      }}>
      <Tabs.Screen
        name="general"
        options={{
          title: 'General',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="service"
        options={{
          title: 'Servicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="build-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employe"
        options={{
          title: 'Empleado',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
