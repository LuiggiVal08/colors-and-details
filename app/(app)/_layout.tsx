import { Stack, useRouter, Redirect } from 'expo-router';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Avatar, Divider, Menu, Text } from 'react-native-paper';
import { useAuthStore } from '../../store/auth';

export default function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleMenu = (path: string) => {
    setVisible(false);
    router.push(path);
  };

  return (
    <Stack
      screenOptions={{
        headerTitle: 'Colores y Detalles',
        headerRight: () => (
          <Menu
            visible={visible}
            anchorPosition="bottom"
            onDismiss={() => setVisible(false)}
            theme={{
              colors: {
                elevation: {
                  level2: '#fff',
                },
              },
            }}
            anchor={
              <TouchableOpacity onPress={() => setVisible(true)} className="mr-3">
                <Avatar.Text size={36} label={user.name.slice(0, 1).toUpperCase()} />
              </TouchableOpacity>
            }>
            <Menu.Item
              onPress={() => handleMenu('/profile')}
              leadingIcon="account"
              title="Perfil"
            />
            <Menu.Item
              onPress={() => handleMenu('/settings')}
              leadingIcon="cog"
              title="Configuración"
            />
            <Menu.Item
              onPress={() => handleMenu('/inventory')}
              leadingIcon="tools"
              title="Mantenimiento"
            />
            <Menu.Item
              onPress={() => handleMenu('/help')}
              leadingIcon="help-circle"
              title="Ayuda"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                logout();
                setVisible(false);
                router.replace('/login');
              }}
              leadingIcon="logout"
              title="Cerrar sesión"
              //   titleStyle={{ color: 'red' }} // Opcional: para resaltar que es salir
            />
          </Menu>
        ),
      }}>
      <Stack.Screen name="(tabs)" options={{ title: 'Inicio' }} />
      <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="payments-methods" options={{ title: 'Formas de pago' }} />
      <Stack.Screen name="(admin)" options={{ title: 'Administración' }} />
      <Stack.Screen name="(super)" options={{ title: 'Gestión' }} />
    </Stack>
  );
}
