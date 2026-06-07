import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmColor = variant === 'danger' ? 'bg-rose-500' : 'bg-amber-500';
  const iconName = variant === 'danger' ? 'trash-outline' : 'warning-outline';
  const iconBg = variant === 'danger' ? 'bg-rose-100' : 'bg-amber-100';
  const iconColor = variant === 'danger' ? '#E11D48' : '#D97706';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-primary-dark">
          <View className="items-center">
            <View className={`h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
              <Ionicons name={iconName} size={28} color={iconColor} />
            </View>
            <Text className="mt-3 text-center text-lg font-bold text-slate-900">{title}</Text>
            <Text className="mt-2 text-center text-sm text-slate-500">{message}</Text>
          </View>

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              disabled={isLoading}
              className="flex-1 items-center rounded-2xl border border-slate-200 py-3">
              <Text className="font-medium text-slate-600">{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              className={`flex-1 items-center rounded-2xl py-3 ${confirmColor}`}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-bold text-white">{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
