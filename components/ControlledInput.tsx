import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { View } from 'react-native';
import { HelperText, TextInput, TextInputProps, useTheme } from 'react-native-paper';

interface ControlledInputProps<T extends FieldValues> extends Omit<TextInputProps, 'error'> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: string; // Ahora tu 'string' no choca con nadie
  readOnly?: boolean;
}

// Añadimos <T extends FieldValues> antes de los argumentos
export const ControlledInput = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  readOnly = false,
  onChangeText,
  style,
  outlineStyle,
  ...props
}: ControlledInputProps<T>) => {
  const { colors, dark } = useTheme();
  const readOnlyBackgroundColor = dark ? '#334155' : '#f8fafc';
  const inputBackgroundColor = dark ? colors.surface : '#ffffff';

  const inputOutlineStyle = [
    {
      borderRadius: 12,
      backgroundColor: readOnly ? readOnlyBackgroundColor : inputBackgroundColor,
      borderColor: readOnly ? (dark ? '#64748b' : '#cbd5e1') : undefined,
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
            onChangeText={(text) => onChange(onChangeText ? onChangeText(text) : text)}
            error={!!error}
            editable={!readOnly}
            textColor={colors.onSurface}
            placeholderTextColor={colors.onSurfaceVariant}
            outlineStyle={inputOutlineStyle}
            style={[{ backgroundColor: readOnly ? readOnlyBackgroundColor : inputBackgroundColor }, style]}
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
