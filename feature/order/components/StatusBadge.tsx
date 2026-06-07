import { View, Text } from 'react-native';
import type { OrderStatus } from '@/types/order';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; icon: string }> = {
  pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'time-outline' },
  procesado: { label: 'En Proceso', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'sync-outline' },
  completado: { label: 'Completado', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'checkmark-circle-outline' },
  cancelado: { label: 'Cancelado', bg: 'bg-rose-100', text: 'text-rose-700', icon: 'close-circle-outline' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  const padding = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <View className={`rounded-full ${config.bg} ${padding}`}>
      <Text className={`font-semibold ${config.text} ${textSize}`}>{config.label}</Text>
    </View>
  );
}

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status: OrderStatus): { bg: string; text: string } {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendiente;
  return { bg: config.bg, text: config.text };
}
