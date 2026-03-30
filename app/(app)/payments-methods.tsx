import { Text, View } from 'react-native';
import ScreenLayout from '../../components/layout/ScreenLayout';

export default function PaymentsMethodsScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-2xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Métodos de pago</Text>
        <Text className="text-slate-600">
          Aquí se muestran los métodos de pago configurados para la cuenta.
        </Text>
      </View>
    </ScreenLayout>
  );
}
