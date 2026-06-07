import { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { NotificationCard } from './NotificationCard';
import { useNotificationStore } from '@/store/notification';
import notificationService from '@/services/notification.service';

export const NotificationList = () => {
  const { notifications, loading, unreadCount, load, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = async (notif: Notification) => {
    if (!notif.leido) {
      try {
        await notificationService.markAsRead(notif.id);
        markAsRead(notif.id);
      } catch {}
    }

    if (notif.url) {
      router.push(notif.url);
    } else if (notif.entidad_tipo && notif.entidad_id) {
      const route =
        notif.entidad_tipo === 'ORDER'
          ? `/order/${notif.entidad_id}`
          : `/(admin)/service/${notif.entidad_id}`;
      router.push(route as any);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View className="w-full flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4DB6AC" />
      </View>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <View className="w-full flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-4xl">🔔</Text>
        <Text className="text-center text-base text-gray-500 dark:text-gray-400">
          No tienes notificaciones
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full flex-1">
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={markAllAsRead}
          className="mx-4 mt-2 rounded-lg bg-primary-dark/10 px-4 py-2">
          <Text className="text-center text-sm font-medium text-primary-dark">
            Marcar todas como leídas ({unreadCount})
          </Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="gap-2 p-4"
        renderItem={({ item }) => <NotificationCard notification={item} onPress={handlePress} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
};
