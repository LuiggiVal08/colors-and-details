import { View, Text, TouchableOpacity } from 'react-native';

interface FormHeaderProps {
  title: string;
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
}

export function FormHeader({ title, onCancel, onSave, saveLabel = 'Guardar', saving = false }: FormHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12">
      {onCancel ? (
        <TouchableOpacity onPress={onCancel}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
      ) : <View />}
      <Text className="text-lg font-bold text-slate-900">{title}</Text>
      {onSave ? (
        <TouchableOpacity onPress={onSave} disabled={saving}>
          <Text className={`font-bold ${saving ? 'text-slate-400' : 'text-[#4DB6AC]'}`}>
            {saving ? 'Guardando...' : saveLabel}
          </Text>
        </TouchableOpacity>
      ) : <View />}
    </View>
  );
}
