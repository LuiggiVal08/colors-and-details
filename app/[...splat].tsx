import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-4">
      <Text className="mb-4 text-3xl font-bold text-slate-900">404 - Página no encontrada</Text>
      <Text className="mb-4 text-center text-base text-slate-600">
        La ruta que buscas no existe o no está disponible en este momento.
      </Text>
      <Link href="/login" className="rounded-2xl bg-slate-900 px-5 py-3">
        <Text className="text-base font-semibold text-white">Ir a inicio</Text>
      </Link>
    </View>
  );
}
