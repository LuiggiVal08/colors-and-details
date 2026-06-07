import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ErrorRetryCardProps {
  title?: string;
  message: string;
  onRetry: () => void;
  buttonLabel?: string;
}

const ErrorRetryCard = ({
  title = 'Algo salió mal',
  message,
  onRetry,
  buttonLabel = 'Reintentar',
}: ErrorRetryCardProps) => (
  <View className="mx-4 my-6 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80 dark:bg-primary-dark">
    <Text className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{title}</Text>
    <Text className="mb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</Text>
    <TouchableOpacity
      onPress={onRetry}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityHint="Intenta cargar la información nuevamente"
      className="items-center justify-center rounded-full bg-[#4DB6AC] px-5 py-3">
      <Text className="text-base font-semibold text-white">{buttonLabel}</Text>
    </TouchableOpacity>
  </View>
);

export default ErrorRetryCard;
