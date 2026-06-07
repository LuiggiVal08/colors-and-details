import { useEffect } from 'react';
import { Stack } from 'expo-router';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { NotificationList } from '@/feature/notifications/components/NotificationList';
import { useNotificationStore } from '@/store/notification';

export default function NotificationsScreen() {
  const load = useNotificationStore((state) => state.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Notificaciones', headerRight: () => null }} />
      <NotificationList />
    </ScreenLayout>
  );
}
