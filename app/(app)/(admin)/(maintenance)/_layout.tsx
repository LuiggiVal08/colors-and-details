import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Importamos la librería de iconos

export default function MaintenanceTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
      }}
      safeAreaInsets={{ top: 0 }}>
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="database"
        options={{
          title: 'Base de datos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
