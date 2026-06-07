import { View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import nominaService from '@/services/nomina.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import type { NominaDetalle } from '@/types/nomina';

const estadoLabel: Record<string, { label: string; bg: string; icon: string }> = {
  completed: { label: 'Completada', bg: 'bg-emerald-100', icon: 'checkmark-circle' },
  processing: { label: 'En proceso', bg: 'bg-amber-100', icon: 'time' },
  failed: { label: 'Fallida', bg: 'bg-red-100', icon: 'close-circle' },
};

export default function PayrollDetailScreen() {
  const { id } = useLocalSearchParams();

  const { data: nomina, isLoading, error, refetch } = useQuery({
    queryKey: ['nomina', id],
    queryFn: () => nominaService.getById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 px-4 py-6">
        <SkeletonLoader count={4} />
      </View>
    );
  }

  if (error || !nomina) {
    return (
      <ErrorRetryCard
        title="No se pudo cargar la nómina"
        message="Hubo un problema al obtener los datos."
        onRetry={refetch}
      />
    );
  }

  const estado = estadoLabel[nomina.estado] || estadoLabel.failed;

  return (
    <>
      <Stack.Screen
        options={{
          title: `Nómina ${nomina.periodo_inicio} — ${nomina.periodo_fin}`,
        }}
      />
      <ScreenLayout>
        <View className="w-full max-w-5xl px-4 py-6">
          <Card className="mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-slate-900">Nómina</Text>
                <Text className="text-base text-slate-500">
                  {nomina.periodo_inicio} — {nomina.periodo_fin}
                </Text>
              </View>
              <View className={`rounded-full px-3 py-1 ${estado.bg}`}>
                <Text className="text-sm font-medium">{estado.label}</Text>
              </View>
            </View>

            <View className="mt-6 flex-row gap-4">
              <View className="flex-1 rounded-lg bg-slate-100 p-4">
                <Text className="text-xs text-slate-500">Empleados</Text>
                <Text className="text-2xl font-bold text-slate-900">{nomina.total_empleados}</Text>
              </View>
              <View className="flex-1 rounded-lg bg-slate-100 p-4">
                <Text className="text-xs text-slate-500">Total Bs.</Text>
                <Text className="text-2xl font-bold text-slate-900">
                  {Number(nomina.total_monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {nomina.tasa && (
              <View className="mt-3 flex-row items-center gap-1">
                <Ionicons name="trending-up" size={16} color="#64748B" />
                <Text className="text-sm text-slate-500">
                  Tasa: Bs. {Number(nomina.tasa.tasa).toFixed(2)}
                </Text>
              </View>
            )}
          </Card>

          {nomina.detalles && nomina.detalles.length > 0 && (
            <Card className="mb-6">
              <Text className="mb-4 text-xl font-bold text-slate-900">Empleados</Text>
              {nomina.detalles.map((detalle: NominaDetalle) => (
                <View
                  key={detalle.id}
                  className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-slate-900">
                      {detalle.empleado.nombre} {detalle.empleado.apellido}
                    </Text>
                  </View>
                  <View className="mt-2 flex-row items-center gap-4">
                    <View className="flex-1">
                      <Text className="text-xs text-slate-500">Salario base</Text>
                      <Text className="text-sm font-medium text-slate-700">
                        Bs. {Number(detalle.salario_base).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-500">Bono</Text>
                      <Text className="text-sm font-medium text-emerald-600">
                        Bs. {Number(detalle.bono).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-500">Deducción</Text>
                      <Text className="text-sm font-medium text-red-500">
                        Bs. {Number(detalle.deduccion).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-2 border-t border-slate-200 pt-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-bold text-slate-900">Total</Text>
                      <Text className="text-sm font-bold text-slate-900">
                        Bs. {Number(detalle.monto_total).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        {'  |  '}
                        USD {Number(detalle.monto_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {nomina.detalles && nomina.detalles.length === 0 && (
            <Card className="mb-6">
              <View className="items-center justify-center py-8">
                <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                <Text className="mt-2 text-sm text-slate-500">Sin empleados en esta nómina</Text>
              </View>
            </Card>
          )}
        </View>
      </ScreenLayout>
    </>
  );
}
