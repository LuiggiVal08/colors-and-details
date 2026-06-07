import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  size?: 'sm' | 'md';
}

const BADGE_CONFIG: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700' },
  danger: { bg: 'bg-rose-100', text: 'text-rose-700' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-500' },
};

export function Badge({ variant = 'neutral', label, size = 'sm' }: BadgeProps) {
  const config = BADGE_CONFIG[variant];
  const padding = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <View className={`rounded-full ${config.bg} ${padding}`}>
      <Text className={`font-semibold ${config.text} ${textSize}`}>{label}</Text>
    </View>
  );
}
