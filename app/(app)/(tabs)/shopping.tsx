import { Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import ScreenLayout from '../../../components/layout/ScreenLayout';

export default function ShoppingScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90  p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Ventas</Text>
        <Text className="mb-6 text-slate-600">
          Aquí puedes gestionar los procesos de venta y revisar el resumen comercial.
        </Text>
        <View className="space-y-3">
          <TouchableOpacity className="rounded-2xl bg-slate-900 px-5 py-4">
            <Text className="text-center text-base font-semibold text-white">
              Crear nueva orden
            </Text>
          </TouchableOpacity>
          <Link
            href="/orders"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <Text className="text-center text-base font-semibold text-slate-900">Ver pedidos</Text>
          </Link>
        </View>
      </View>
    </ScreenLayout>
  );
}
