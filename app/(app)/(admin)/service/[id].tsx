import { useState } from 'react';
import { Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import serviceService from '@/services/service.service';
import servicePeriodService from '@/services/servicePeriod.service';
import { EditServiceForm } from '@/feature/service/components/EditServiceForm';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Divider, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import Card from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
  paid: { label: 'Pagado', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  partial: { label: 'Parcial', bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function ServiceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: servicio,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['servicio', id],
    queryFn: () => serviceService.getById(id as string),
    enabled: !!id,
  });

  const servicioId = Number(id);

  const { data: periodsRaw, isLoading: loadingPeriods } = useQuery({
    queryKey: ['service-periods', servicioId],
    queryFn: () => servicePeriodService.getByService(servicioId),
    enabled: !!servicioId && !isNaN(servicioId),
  });
  const periods = Array.isArray(periodsRaw) ? periodsRaw : [];

  const [visible, setVisible] = useState(false);

  if (isLoading)
    return (
      <View className="flex-1 px-4 py-6">
        <SkeletonLoader count={4} />
      </View>
    );

  if (error || !servicio)
    return (
      <ErrorRetryCard
        title="No se pudo cargar el servicio"
        message="Hubo un problema al obtener los datos. Revisa tu conexión y vuelve a intentarlo."
        onRetry={refetch}
      />
    );

  const precioActual = servicio.precios?.[0];

  return (
    <>
      <Stack.Screen
        options={{
          title: servicio?.nombre || 'Servicio',
          headerRight: () => (
            <Menu
              visible={visible}
              anchorPosition="bottom"
              onDismiss={() => setVisible(false)}
              theme={{ colors: { elevation: { level2: '#fff' } } }}
              anchor={
                <TouchableOpacity onPress={() => setVisible(true)} className="mr-3">
                  <Ionicons name="ellipsis-vertical" size={24} />
                </TouchableOpacity>
              }>
              <Menu.Item
                onPress={() => {
                  setIsModalOpen(true);
                  setVisible(false);
                }}
                leadingIcon="cog"
                title="Editar Servicio"
              />
            </Menu>
          ),
        }}
      />
      <ScreenLayout scrollEnabled={true}>
        <View className="w-full px-4 pt-4">
          <Card className="mb-6">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                  <Ionicons name="construct" size={32} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-slate-900">{servicio.nombre}</Text>
                  {servicio.proveedor ? <Text className="text-base text-slate-500">{servicio.proveedor}</Text> : null}
                </View>
              </View>
            </View>
            <Divider className="mb-4" />
            {servicio.descripcion ? (
              <View className="mb-4">
                <Text className="mb-1 text-sm font-medium text-slate-500">Descripción</Text>
                <Text className="text-base text-slate-700">{servicio.descripcion}</Text>
              </View>
            ) : null}
            <View className="mb-4 flex-row items-center gap-3">
              <Ionicons name="calendar" size={20} color="#64748b" />
              <Text className="flex-1 text-base text-slate-700">Día de corte: {servicio.dia_corte}</Text>
            </View>
            {precioActual ? (
              <View className="mb-4 flex-row items-center gap-3">
                <Ionicons name="pricetag" size={20} color="#64748b" />
                <Text className="flex-1 text-base text-slate-700">Precio actual: ${precioActual.precio}</Text>
              </View>
            ) : null}
            {precioActual?.fecha_inicio ? (
              <View className="mb-4 flex-row items-center gap-3">
                <Ionicons name="trending-up" size={20} color="#64748b" />
                <Text className="flex-1 text-base text-slate-700">
                  Precio vigente desde {new Date(precioActual.fecha_inicio).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </Card>

          <Card className="mb-6 p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-slate-900">Períodos</Text>
              <TouchableOpacity
                onPress={() => router.push(`/service/${id}/period/create`)}
                className="rounded-full bg-[#4DB6AC] px-3 py-1.5">
                <Text className="text-sm font-semibold text-white">+ Período</Text>
              </TouchableOpacity>
            </View>
            {loadingPeriods ? (
              <ActivityIndicator size="small" color="#4DB6AC" />
            ) : periods.length === 0 ? (
              <Text className="text-sm text-slate-400">Sin períodos generados</Text>
            ) : (
              periods.map((period) => {
                const st = statusConfig[period.estado] || statusConfig.pending;
                return (
                  <View
                    key={period.id}
                    className="mb-2 rounded-lg border border-slate-100 p-3 dark:border-slate-700 dark:bg-primary-dark">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-slate-900">
                        {MONTH_NAMES[period.mes - 1]} {period.anualidad}
                      </Text>
                      <View className={`rounded-full px-2 py-0.5 ${st.bg}`}>
                        <Text className={`text-xs font-medium ${st.text}`}>{st.label}</Text>
                      </View>
                    </View>
                    <View className="mt-2 flex-row items-center justify-between">
                      <Text className="text-sm text-slate-500">Monto: ${Number(period.amount_due).toFixed(2)}</Text>
                      {period.amount_balance ? (
                        <Text className="text-sm text-slate-500">
                          Balance: ${Number(period.amount_balance).toFixed(2)}
                        </Text>
                      ) : null}
                    </View>
                    {period.fecha_corte ? (
                      <Text className="mt-1 text-xs text-slate-400">
                        Corte: {new Date(period.fecha_corte).toLocaleDateString('es-VE')}
                      </Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </Card>

          <TouchableOpacity
            onPress={() => router.push(`/service/${id}/payment/create`)}
            className="mb-6 flex-row items-center justify-center gap-2 rounded-2xl bg-[#4DB6AC] py-4">
            <Ionicons name="card-outline" size={20} color="white" />
            <Text className="text-base font-semibold text-white">Registrar Pago</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>

      <Modal
        visible={isModalOpen}
        animationType="slide"
        statusBarTranslucent={true}
        onDismiss={() => setIsModalOpen(false)}
        onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <View className="flex-1">
            <EditServiceForm initialData={servicio} onClose={() => setIsModalOpen(false)} onSuccess={() => refetch()} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
