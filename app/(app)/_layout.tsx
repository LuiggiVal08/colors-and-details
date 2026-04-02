import { useEffect } from 'react'; // 👈 Importamos useEffect
import { useRouter, Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import api from '@/services/api'; // 👈 Tu instancia de Axios con interceptores
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Avatar, Menu, Divider } from 'react-native-paper';
import React, { useState } from 'react';

export default function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // 🛡️ EFECTO DE VALIDACIÓN SILENCIOSA
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Hacemos la petición al endpoint que acabamos de crear
        await api.get('/validate');
        console.log('Sesión verificada con éxito');
      } catch (error) {
        // No necesitas hacer nada aquí.
        // Tu interceptor de Axios ya detectará el 401 y ejecutará el logout()
        console.log('La sesión expiró o es inválida');
      }
    };

    // Solo verificamos si ya cargó el SecureStore y si hay un usuario logueado
    if (hasHydrated && user) {
      checkSession();
    }
  }, [hasHydrated, user?.token]); // Se ejecuta al abrir y si el token cambia

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
      <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="payments-methods" options={{ title: 'Formas de pago' }} />
      <Stack.Screen name="(admin)" options={{ title: 'Administración' }} />
      <Stack.Screen name="(super)" options={{ title: 'Gestión' }} />
    </Stack>
  );
}
