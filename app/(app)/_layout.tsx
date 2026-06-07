import { useEffect, useState } from 'react';
import { useRouter, Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import api from '@/services/api';
import { ActivityIndicator, Text, TouchableOpacity, View, useColorScheme, AppState } from 'react-native';
import { Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { connectSocket, disconnectSocket } from '@/services/socket';
import { useExchangeRateStore } from '@/store/exchangeRate';
import { useIVAStore } from '@/store/iva';
import { useBoxRegisterStore } from '@/store/boxRegister';
import { useNotificationStore } from '@/store/notification';
import { themeDark } from '@/constants/theme';
export default function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const loadTasa = useExchangeRateStore((state) => state.load);
  const loadIva = useIVAStore((state) => state.load);
  const loadActiveBox = useBoxRegisterStore((state) => state.loadActiveBox);
  const loadNotifs = useNotificationStore((state) => state.load);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    const validate = async () => {
      const { user, _hasHydrated } = useAuthStore.getState();
      if (!_hasHydrated || !user?.token) {
        setIsValidating(false);
        return;
      }
      try {
        await api.get('/validate');
        connectSocket(user.token);
      } catch {
        disconnectSocket();
        logout();
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [hasHydrated, logout]);

  useEffect(() => {
    if (hasHydrated) loadTasa();
  }, [hasHydrated, loadTasa]);

  useEffect(() => {
    if (hasHydrated) loadIva();
  }, [hasHydrated, loadIva]);

  useEffect(() => {
    if (hasHydrated && user?.token) {
      loadActiveBox();
      loadNotifs();
    }
  }, [hasHydrated, loadActiveBox, loadNotifs, user?.token]);

  useEffect(() => {
    if (!hasHydrated) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const { user, _hasHydrated } = useAuthStore.getState();
        if (!_hasHydrated || !user?.token) return;
        api.get('/validate').catch(async () => {
          await new Promise((r) => setTimeout(r, 2000));
          const { user: u, _hasHydrated: h } = useAuthStore.getState();
          if (!h || !u?.token) return;
          try {
            await api.get('/validate');
          } catch {
            disconnectSocket();
            logout();
          }
        });
      }
    });

    return () => subscription.remove();
  }, [hasHydrated, logout]);

  if (!hasHydrated || isValidating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4DB6AC" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const isDark = colorScheme === 'dark';
  const headerBg = isDark ? themeDark.colors.surface : '#FFFFFF';
  const headerText = isDark ? '#FFFFFF' : '#000000';

  return (
    <Stack
      screenOptions={{
        headerTitle: 'Colores y Detalles',
        animation: 'ios_from_right',
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerText,

        headerRight: () => (
          <View className="flex-row items-center justify-center gap-2">
            <ExchangeRate />
            <TouchableOpacity onPress={() => router.push('/notifications')} className="relative mr-3">
              <Ionicons name="notifications-outline" size={24} color="#4DB6AC" />
              {unreadCount > 0 && (
                <Badge size={16} className="absolute right-0 top-0" style={{ backgroundColor: '#f87171' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </TouchableOpacity>
          </View>
        ),
      }}>
      <Stack.Screen name="(tabs)" options={{ title: 'Inicio' }} />
      <Stack.Screen name="profile" options={{ title: 'Mi Perfil', headerRight: () => null }} />
      <Stack.Screen name="(admin)" options={{ title: 'Administración', headerShown: false, headerRight: () => null }} />
      <Stack.Screen name="(super)" options={{ title: 'Gestión', headerShown: false, headerRight: () => null }} />
      <Stack.Screen name="help" options={{ title: 'Ayuda', headerRight: () => null }} />
      <Stack.Screen name="backup" options={{ title: 'Respaldo', headerRight: () => null }} />
    </Stack>
  );
}
export const ExchangeRate = () => {
  const tasa = useExchangeRateStore((state) => state.tasa);
  const colorScheme = useColorScheme();

  if (tasa === null) return null;

  const formatted = tasa.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View className="flex-row items-center justify-center gap-2">
      <Text className={`text-sm ${colorScheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
        1 USD = {formatted} Bs
      </Text>
    </View>
  );
};
