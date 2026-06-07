import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationItemProps } from '../types';

const TIPO_ICON: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  warning: { name: 'warning-outline', color: '#f59e0b' },
  danger: { name: 'alert-circle-outline', color: '#ef4444' },
  info: { name: 'information-circle-outline', color: '#3b82f6' },
};

export const NotificationCard = ({ notification, onPress }: NotificationItemProps) => {
  const icon = TIPO_ICON[notification.tipo] ?? TIPO_ICON.info;

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`flex-row items-start gap-3 rounded-xl p-4 ${
        notification.leido ? 'bg-white dark:bg-neutral-800' : 'bg-primary-dark/5 dark:bg-primary-dark/10'
      }`}>
      <View className="mt-0.5">
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm font-semibold text-black dark:text-white">
            {notification.mensaje}
          </Text>
          <Text className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {formatDate(notification.creado_en)}
          </Text>
        </View>
      </View>
      {!notification.leido && (
        <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-error" />
      )}
    </TouchableOpacity>
  );
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });
}
