import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useBoxRegisterStore } from '@/store/boxRegister';

export default function CajaIndicator() {
  const router = useRouter();
  const { activeBox, loading } = useBoxRegisterStore();

  if (loading) return null;

  if (!activeBox) {
    return (
      <TouchableOpacity
        onPress={() => router.push('/box-register')}
        className="flex-row items-center gap-1.5 rounded-full border border-error/20 bg-error/5 px-3 py-1">
        <View className="h-1.5 w-1.5 rounded-full bg-error" />
        <Text className="text-xs font-medium text-error">Sin caja abierta</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/box-register/${activeBox.caja_id}`)}
      className="flex-row items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-3 py-1">
      <View className="h-1.5 w-1.5 rounded-full bg-success" />
      <Text className="text-xs font-medium text-success">
        {activeBox.caja_nombre || 'Caja'}
      </Text>
      <Text className="text-[10px] text-slate-500 dark:text-slate-400">por {activeBox.usuario_nombre}</Text>
    </TouchableOpacity>
  );
}
