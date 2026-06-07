import { Text } from 'react-native';
import { Stack } from 'expo-router';
import ScreenLayout from '../../../../components/layout/ScreenLayout';
import Card from '@/components/Card';

export default function ManagementScreen() {
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: 'Gestión' }} />
      <Card className="w-full max-w-3xl p-8">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Gestión</Text>
        <Text className="text-slate-600">Zona de administración exclusiva para superadmin.</Text>
      </Card>
    </ScreenLayout>
  );
}
