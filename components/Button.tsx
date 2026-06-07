import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  loading?: boolean;
  children: string;
}

const variantClasses: Record<ButtonVariant, { button: string; text: string }> = {
  primary: { button: 'bg-[#4DB6AC]', text: 'text-white' },
  secondary: { button: 'border border-slate-200 bg-white dark:border-slate-600 dark:bg-primary-dark', text: 'text-slate-600 dark:text-slate-300' },
  danger: { button: 'bg-rose-500', text: 'text-white' },
  text: { button: 'bg-transparent', text: 'text-[#4DB6AC]' },
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const config = variantClasses[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      className={`items-center justify-center rounded-full ${config.button} ${isDisabled ? 'bg-slate-300 dark:bg-slate-600' : ''} ${className}`}
      style={[{ minHeight: 44 }, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#4DB6AC'} />
      ) : (
        <Text className={`text-center font-semibold ${isDisabled ? 'text-white' : config.text}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
