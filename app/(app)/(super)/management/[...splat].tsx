import { Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../../../../components/layout/ScreenLayout';
import Card from '@/components/Card';

export default function ManagementCatchAllScreen() {
  const params = useLocalSearchParams<{ splat: string[] }>();
  const path = Array.isArray(params.splat) ? params.splat.join('/') : '';

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'No encontrada' }} />
      <Card className="w-full max-w-3xl p-8">
        <Text className="mb-4 text-3xl font-bold text-slate-900">
          Ruta de management no encontrada
        </Text>
        <Text className="text-slate-600">Subruta: {path}</Text>
      </Card>
    </ScreenLayout>
  );
}
