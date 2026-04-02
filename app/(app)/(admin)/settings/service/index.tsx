import ScreenLayout from '@/components/layout/ScreenLayout';
import { Text, View } from 'react-native';

const Service = () => {
  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Servicio</Text>
        <Text className="text-slate-600">Pantalla principal de ajustes del servicio.</Text>
      </View>
    </ScreenLayout>
  );
};
export default Service;
