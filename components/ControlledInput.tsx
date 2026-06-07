import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { View } from 'react-native';
import { HelperText, TextInput, TextInputProps } from 'react-native-paper';

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
  const inputOutlineStyle = [
    {
      borderRadius: 12,
      backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
      borderColor: readOnly ? '#cbd5e1' : undefined,
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
            outlineStyle={inputOutlineStyle}
            style={[style, readOnly ? { backgroundColor: '#f8fafc' } : undefined]}
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
