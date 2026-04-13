import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { View } from 'react-native';
import { HelperText, TextInput, TextInputProps } from 'react-native-paper';

interface ControlledInputProps<T extends FieldValues> extends Omit<TextInputProps, 'error'> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: string; // Ahora tu 'string' no choca con nadie
}

// Añadimos <T extends FieldValues> antes de los argumentos
export const ControlledInput = <T extends FieldValues>({
  name,
  label,
  control,
  error,
  ...props
}: ControlledInputProps<T>) => {
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
            onChangeText={onChange}
            error={!!error}
            outlineStyle={{ borderRadius: 12 }}
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
