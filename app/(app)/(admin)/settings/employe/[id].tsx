import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '../../../../../components/layout/ScreenLayout';

export default function EmployeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Empleado</Text>
        <Text className="text-slate-600">ID del empleado: {id}</Text>
      </View>
    </ScreenLayout>
  );
}
