import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import ScreenLayout from '@/components/layout/ScreenLayout';
import productMovementService from '@/services/productMovement.service';

export default function MovementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: movement, isLoading } = useQuery({
    queryKey: ['inventory', 'movement', id],
    queryFn: () => productMovementService.getById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detalle de movimiento' }} />
        <ScreenLayout>
          <View className="w-full items-center justify-center px-4 py-6">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        </ScreenLayout>
      </>
    );
  }

  if (!movement) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detalle de movimiento' }} />
        <ScreenLayout>
          <View className="w-full px-4 py-6">
            <View className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-50/20 dark:bg-primary-dark">
              <Text className="text-xl font-semibold text-slate-900">Movimiento no encontrado</Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-6 items-center rounded-full bg-[#4DB6AC] px-5 py-3">
                <Text className="text-center text-base font-semibold text-white">Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScreenLayout>
      </>
    );
  }

  const isEntrada = movement.tipo === 'entrada';
  const fmt = (n: number) =>
    n.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <>
      <Stack.Screen options={{ title: 'Movimiento #' + movement.id }} />
      <ScreenLayout>
        <View className="w-full max-w-3xl px-4 py-6">
          <View className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-50/20 dark:bg-primary-dark">
            <View className="mb-4 flex-row items-center gap-3">
              <View
                className={`h-12 w-12 items-center justify-center rounded-2xl ${
                  isEntrada ? 'bg-emerald-100' : 'bg-rose-100'
                }`}>
                <Ionicons
                  name={isEntrada ? 'arrow-up' : 'arrow-down'}
                  size={24}
                  color={isEntrada ? '#059669' : '#E11D48'}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-xl font-semibold text-slate-900">{movement.producto}</Text>
                <View
                  className={`mt-1 self-start rounded-full px-3 py-1 ${
                    isEntrada ? 'bg-emerald-100' : 'bg-rose-100'
                  }`}>
                  <Text
                    className={`text-xs font-semibold ${
                      isEntrada ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                    {isEntrada ? 'Entrada' : 'Salida'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-4 flex-row gap-3">
              <View className="rounded-2xl bg-slate-50 p-4">
                <Text className="text-xs text-slate-500">Cantidad</Text>
                <Text
                  className={`mt-1 text-2xl font-bold ${
                    isEntrada ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                  {isEntrada ? '+' : '−'}
                  {fmt(movement.cantidad)}
                </Text>
              </View>
              <View className="rounded-2xl bg-slate-50 p-4">
                <Text className="text-xs text-slate-500">Stock resultante</Text>
                <Text className="mt-1 text-2xl font-bold text-slate-900">
                  {fmt(movement.stockActual)}
                </Text>
              </View>
            </View>

            {movement.stock_antes !== undefined && movement.stock_despues !== undefined && (
              <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                <Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Cambio de stock
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-slate-500">Antes</Text>
                    <Text className="text-lg font-semibold text-slate-900">
                      {fmt(movement.stock_antes)}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#94A3B8" />
                  <View className="items-end">
                    <Text className="text-xs text-slate-500">Después</Text>
                    <Text className="text-lg font-semibold text-slate-900">
                      {fmt(movement.stock_despues)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="gap-3">
              <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                <Text className="text-xs text-slate-500">Fecha y hora</Text>
                <Text className="mt-1 text-base font-medium text-slate-900">
                  {new Date(movement.fecha).toLocaleString('es-VE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {movement.motivo && (
                <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                  <Text className="text-xs text-slate-500">Motivo</Text>
                  <Text className="mt-1 text-sm text-slate-900">{movement.motivo}</Text>
                </View>
              )}
              {movement.usuario_nombre && (
                <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                  <Text className="text-xs text-slate-500">Registrado por</Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    <Ionicons name="person-circle-outline" size={20} color="#475569" />
                    <Text className="text-sm font-medium text-slate-900">
                      {movement.usuario_nombre}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 items-center rounded-2xl bg-[#4DB6AC] py-3">
              <Text className="text-sm font-semibold text-white">Volver al listado</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenLayout>
    </>
  );
}
