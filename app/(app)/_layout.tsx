import { useEffect, useState } from 'react'; // 👈 Importamos useEffect
import { useRouter, Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import api from '@/services/api'; // 👈 Tu instancia de Axios con interceptores
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Avatar, Menu, Divider } from 'react-native-paper';

export const validateSessionAction = async () => {
  const { user, _hasHydrated } = useAuthStore.getState();
  if (!_hasHydrated || !user?.token) return;
  try {
    await api.get('/validate');
    console.info('Sesión validada imperativamente');
  } catch (error) {
    console.info('Error en validación silenciosa', error);
  }
};
export default function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (hasHydrated) validateSessionAction();
  }, [hasHydrated]);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4DB6AC" />
      </View>
    );
  }

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
        animation: 'ios_from_right',

        headerRight: () => (
          <Menu
            visible={visible}
            anchorPosition="bottom"
            onDismiss={() => setVisible(false)}
            theme={{ colors: { elevation: { level2: '#fff' } } }}
            anchor={
              <TouchableOpacity onPress={() => setVisible(true)} className="mr-3">
                <Avatar.Text size={36} label={user?.username?.slice(0, 1).toUpperCase() || ''} />
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
            />
          </Menu>
        ),
      }}>
      <Stack.Screen name="(tabs)" options={{ title: 'Inicio' }} />
      <Stack.Screen name="profile" options={{ title: 'Mi Perfil', headerRight: () => null }} />
      <Stack.Screen
        name="payments-methods"
        options={{ title: 'Formas de pago', headerRight: () => null }}
      />
      <Stack.Screen name="(admin)" options={{ title: 'Administración', headerRight: () => null }} />
      <Stack.Screen name="(super)" options={{ title: 'Gestión', headerRight: () => null }} />
    </Stack>
  );
}
