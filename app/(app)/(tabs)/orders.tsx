import { Text, View } from 'react-native';
import ScreenLayout from '../../../components/layout/ScreenLayout';

export default function OrdersScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Pedidos</Text>
        <Text className="text-slate-600">Lista de pedidos recientes y estado de envíos.</Text>
      </View>
    </ScreenLayout>
  );
}
