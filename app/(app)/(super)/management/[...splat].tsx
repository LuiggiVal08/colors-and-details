import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../../../../components/layout/ScreenLayout';

export default function ManagementCatchAllScreen() {
  const params = useLocalSearchParams<{ splat: string[] }>();
  const path = Array.isArray(params.splat) ? params.splat.join('/') : '';

  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">
          Ruta de management no encontrada
        </Text>
        <Text className="text-slate-600">Subruta: {path}</Text>
      </View>
    </ScreenLayout>
  );
}
