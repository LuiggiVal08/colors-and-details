import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { View, useColorScheme } from 'react-native';
import { HelperText, TextInput, TextInputProps } from 'react-native-paper';

interface ControlledInputProps<T extends FieldValues> extends Omit<TextInputProps, 'error' | 'onChangeText'> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: string;
  readOnly?: boolean;
  onChangeText?: (text: string) => string;
}

export const ControlledInput = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  readOnly = false,
  onChangeText: transform,
  style,
  outlineStyle,
  ...props
}: ControlledInputProps<T>) => {
  const isDark = useColorScheme() === 'dark';
  const inputOutlineStyle = [
    {
      borderRadius: 12,
      backgroundColor: readOnly ? (isDark ? '#1E293B' : '#f8fafc') : (isDark ? '#1E1E1E' : '#ffffff'),
      borderColor: readOnly ? (isDark ? '#475569' : '#cbd5e1') : undefined,
    },
    outlineStyle,
  ];

  return (
    <View className="mb-4">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            mode="outlined"
            label={label}
            // Importante: value podría ser null/undefined o boolean,
            // siempre enviamos string al input
            value={value !== undefined && value !== null ? String(value) : ''}
            onBlur={onBlur}
            onChangeText={(text) => onChange(transform ? transform(text) : text)}
            error={!!error}
            editable={!readOnly}
            outlineStyle={inputOutlineStyle}
            style={[style, readOnly ? { backgroundColor: isDark ? '#1E293B' : '#f8fafc' } : undefined]}
            {...props}
          />
        )}
      />

      {/* {error && <Text className="ml-1 mt-1 text-xs font-medium text-red-500">{error}</Text>} */}
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};
