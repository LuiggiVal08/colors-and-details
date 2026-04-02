import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import ScreenLayout from '../../../components/layout/ScreenLayout';

export default function MoreScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Más</Text>
        <Text className="mb-4 text-slate-600">
          Accede a las funciones adicionales de tu aplicación.
        </Text>
        <View className="space-y-3">
          <Link
            href="/payments-methods"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <Text className="text-base font-semibold text-slate-900">Métodos de pago</Text>
          </Link>
          <Link
            href="/inventory"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <Text className="text-base font-semibold text-slate-900">Inventario</Text>
          </Link>
        </View>
      </View>
    </ScreenLayout>
  );
}
