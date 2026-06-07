import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import orderService from '@/services/order.service';
import { useAuthStore } from '@/store/auth';
import { StatusBadge, getStatusLabel } from '@/feature/order/components/StatusBadge';
import type { OrderStatus, OrderPayment } from '@/types/order';
import { impactLight, selection } from '@/helpers/haptics';
import Card from '@/components/Card';

const STATUS_OPTIONS: { value: OrderStatus; label: string; icon: 'time-outline' | 'sync-outline' | 'checkmark-circle-outline' | 'close-circle-outline' }[] = [
  { value: 'procesado', label: 'En Proceso', icon: 'sync-outline' },
  { value: 'completado', label: 'Completado', icon: 'checkmark-circle-outline' },
  { value: 'cancelado', label: 'Cancelar Pedido', icon: 'close-circle-outline' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentDetail, setShowPaymentDetail] = useState<OrderPayment | null>(null);
  const user = useAuthStore((s) => s.user);

  const orderId = Number(id);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId,
  });

  const { data: payments } = useQuery({
    queryKey: ['order-payments', orderId],
    queryFn: () => orderService.getPayments(orderId),
    enabled: !!orderId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => orderService.updateStatus(orderId, status),
    onSuccess: (_, status) => {
      impactLight();
      setShowStatusModal(false);
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      const msg = status === 'cancelado' ? 'Pedido cancelado' : 'Estado actualizado';
      setSnackbar({ visible: true, message: msg });
      if (status === 'cancelado') setTimeout(() => router.back(), 800);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al actualizar estado' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => orderService.delete(orderId),
    onSuccess: () => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ visible: true, message: 'Pedido eliminado' });
      setTimeout(() => router.back(), 800);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al eliminar pedido' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => orderService.updateStatus(orderId, 'completado'),
    onSuccess: () => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ visible: true, message: 'Pedido completado' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al completar pedido' });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
      queryClient.invalidateQueries({ queryKey: ['order-payments', orderId] }),
    ]);
    setRefreshing(false);
  }, [queryClient, orderId]);

  const handleComplete = () => {
    impactLight();
    Alert.alert('Completar Pedido', '¿Marcar este pedido como completado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Completar',
        onPress: () => completeMutation.mutate(),
      },
    ]);
  };

  const fmt = (n: number) =>
    n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: `Pedido #${id}` }} />
        <ScreenLayout>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        </ScreenLayout>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Stack.Screen options={{ title: `Pedido #${id}` }} />
        <ScreenLayout>
          <View className="px-4 py-6">
            <Card className="mb-4">
              <Text className="mb-2 text-xl font-bold text-slate-900">Pedido no encontrado</Text>
              <Text className="mb-4 text-slate-600">
                El pedido que buscas no existe o ha sido eliminado.
              </Text>
              <TouchableOpacity onPress={() => router.back()} className="w-full items-center rounded-full bg-[#4DB6AC] py-3">
                <Text className="font-semibold text-white">Volver</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </ScreenLayout>
      </>
    );
  }

  const totalConIva = order.total + order.total * (order.iva_porcentaje / 100);
  const totalPagado = payments?.reduce((sum, p) => sum + p.monto, 0) ?? 0;
  const saldoPendiente = totalConIva - totalPagado;
  const pagoCompleto = saldoPendiente <= 0;
  const puedePagar = !pagoCompleto && order.estado !== 'cancelado';
  const puedeCambiarEstado = order.estado !== 'completado' && order.estado !== 'cancelado';
  const puedeCompletar = (order.estado === 'pendiente' || order.estado === 'procesado') && pagoCompleto;

  return (
    <>
      <Stack.Screen options={{ title: `Pedido #${order.id}` }} />
      <ScreenLayout scrollEnabled={false} className="px-4 pt-2">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}>
          <Card className="mb-4">
            <View className="mb-4 flex-row items-start justify-between">
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl font-bold text-slate-900">#{order.id}</Text>
                  <StatusBadge status={order.estado} size="md" />
                </View>
                <Text className="mt-1 text-sm text-slate-500">
                  Creado {fmtDate(order.fecha)}
                </Text>
              </View>
            </View>

            <View className="mb-3 flex-row items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-primary-dark">
              <Ionicons name="person-outline" size={22} color="#64748B" />
              <View className="min-w-0 flex-1">
                <Text className="text-base font-medium text-slate-900">
                  {order.cliente_nombre || `Cliente #${order.cliente_id}`}
                </Text>
                {order.usuario_nombre && (
                  <Text className="text-xs text-slate-500">Creado por {order.usuario_nombre}</Text>
                )}
              </View>
            </View>

            <View className="mb-3 flex-row gap-3">
              <View className="flex-1 rounded-2xl bg-slate-50 p-3 dark:bg-primary-dark">
                <Text className="text-xs text-slate-500">Fecha</Text>
                <Text className="mt-0.5 text-sm font-medium text-slate-900">
                  {fmtDate(order.fecha)}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-slate-50 p-3 dark:bg-primary-dark">
                <Text className="text-xs text-slate-500">Entrega</Text>
                <Text className="mt-0.5 text-sm font-medium text-slate-900">
                  {fmtDate(order.fecha_entrega)}
                </Text>
              </View>
            </View>

            {order.observaciones && (
              <Text className="mb-3 text-sm italic leading-5 text-slate-500">
                Nota: {order.observaciones}
              </Text>
            )}
          </Card>

          <View className="mb-4 rounded-2xl border border-[#4DB6AC]/30 bg-[#4DB6AC]/5 p-4 dark:bg-primary-dark">
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-sm text-slate-600">Subtotal (sin IVA)</Text>
              <Text className="text-base font-semibold text-slate-900">Bs. {fmt(order.total)}</Text>
            </View>
            {order.iva_porcentaje > 0 && (
              <View className="flex-row items-center justify-between py-1">
                <Text className="text-sm text-slate-600">IVA ({order.iva_porcentaje}%)</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  Bs. {fmt(order.total * order.iva_porcentaje / 100)}
                </Text>
              </View>
            )}
            <View className="flex-row items-center justify-between border-t border-[#4DB6AC]/20 pt-2">
              <Text className="text-sm font-semibold text-slate-700">Total con IVA</Text>
              <Text className="text-lg font-bold text-slate-900">
                Bs. {fmt(order.total + order.total * order.iva_porcentaje / 100)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-sm text-slate-600">Pagado</Text>
              <Text className="text-sm font-semibold text-emerald-600">Bs. {fmt(totalPagado)}</Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between border-t border-[#4DB6AC]/20 pt-2">
              <Text className="text-sm font-semibold text-slate-700">Saldo</Text>
              <Text
                className={`text-base font-bold ${pagoCompleto ? 'text-emerald-600' : 'text-rose-600'}`}>
                {pagoCompleto ? 'Bs. 0,00' : `Bs. ${fmt(saldoPendiente)}`}
              </Text>
            </View>
          </View>

          {puedeCambiarEstado && (
            <View className="mb-4 flex-row gap-3">
              {puedeCompletar && (
                <TouchableOpacity
                  onPress={handleComplete}
                  disabled={completeMutation.isPending}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#4DB6AC] py-3.5">
                  {completeMutation.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text className="font-bold text-white">Completar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  impactLight();
                  setShowStatusModal(true);
                }}
                className={`flex-row items-center justify-center gap-2 rounded-2xl border border-[#4DB6AC] py-3.5 ${puedeCompletar ? 'px-4' : 'flex-1'}`}>
                <Ionicons name="swap-horizontal" size={16} color="#4DB6AC" />
                <Text className="text-sm font-semibold text-[#4DB6AC]">Estado</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-700">Productos</Text>
            <Text className="text-xs text-slate-500">
              {order.detalles?.length || 0} item{(order.detalles?.length || 0) !== 1 ? 's' : ''}
            </Text>
          </View>

          <View className="mb-4 rounded-2xl border border-slate-100 bg-white dark:bg-primary-dark dark:border-slate-700">
            {order.detalles?.map((d, i) => (
              <View
                key={`${d.producto_id}-${i}`}
                className={`mx-4 py-3 ${i < (order.detalles?.length ?? 0) - 1 ? 'border-b border-slate-100' : ''}`}>
                <View className="flex-row items-center justify-between">
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-medium text-slate-900">
                      {d.producto_nombre || `Producto #${d.producto_id}`}
                    </Text>
                    <Text className="text-xs text-slate-500">
                      Cantidad: {d.cantidad}
                      {d.precio_unitario ? ` · Bs. ${fmt(d.precio_unitario)} c/u` : ''}
                    </Text>
                  </View>
                  {d.subtotal !== undefined && (
                    <Text className="text-sm font-semibold text-slate-900">
                      Bs. {fmt(d.subtotal)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-700">Pagos</Text>
            {puedePagar && (
              <TouchableOpacity
                onPress={() => {
                  impactLight();
                  router.push(`/order/${order.id}/payment`);
                }}
                className="flex-row items-center gap-1.5 rounded-full bg-[#4DB6AC] px-3 py-1.5">
                <Ionicons name="add" size={14} color="#fff" />
                <Text className="text-xs font-semibold text-white">Registrar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4 rounded-2xl border border-slate-100 bg-white dark:bg-primary-dark dark:border-slate-700">
            {!payments || payments.length === 0 ? (
              <View className="items-center py-6">
                <Ionicons name="card-outline" size={32} color="#CBD5E1" />
                <Text className="mt-2 text-sm text-slate-400">Sin pagos registrados</Text>
              </View>
            ) : (
              payments.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => {
                    selection();
                    setShowPaymentDetail(p);
                  }}
                  className={`mx-4 py-3 ${i < payments.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="min-w-0 flex-1">
                      <Text className="text-sm font-medium text-slate-900">
                        {p.metodo_pago_nombre || `Pago #${p.metodo_pago_id}`}
                      </Text>
                      <Text className="text-xs text-slate-500">
                        {new Date(p.fecha).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {p.referencia_pago ? ` · ${p.referencia_pago}` : ''}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-emerald-600">
                      Bs. {fmt(p.monto)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {puedePagar && (
            <TouchableOpacity
              onPress={() => {
                impactLight();
                router.push(`/order/${order.id}/payment`);
              }}
              className="mb-2 items-center rounded-2xl bg-[#4DB6AC] py-3.5">
              <Text className="font-bold text-white">Registrar Pago</Text>
            </TouchableOpacity>
          )}

          {order.estado !== 'cancelado' && (user?.role === 'admin' || user?.role === 'superadmin') && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Eliminar Pedido',
                  '¿Estás seguro? Esta acción no se puede deshacer.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate() },
                  ],
                );
              }}
              disabled={deleteMutation.isPending}
              className="mb-2 items-center rounded-2xl border border-error/30 bg-error/5 py-3.5">
              <View className="flex-row items-center gap-2">
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FF5C93" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#FF5C93" />
                )}
                <Text className="font-medium text-error">Eliminar Pedido</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center rounded-2xl border border-slate-200 bg-white py-3.5 dark:bg-primary-dark dark:border-slate-700">
            <Text className="font-medium text-slate-600">Volver al Listado</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenLayout>

      {showStatusModal && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-primary-dark">
            <Text className="text-lg font-bold text-slate-900">Cambiar Estado</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Actual: {getStatusLabel(order.estado)}
            </Text>
            <View className="mt-4 gap-2">
              {STATUS_OPTIONS.filter((s) => s.value !== order.estado).map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => statusMutation.mutate(s.value)}
                  disabled={statusMutation.isPending}
                  className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:bg-primary-dark dark:border-slate-700">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                    <Ionicons name={s.icon} size={18} color="#475569" />
                  </View>
                  <Text className="flex-1 text-sm font-medium text-slate-900">{s.label}</Text>
                  {statusMutation.isPending && statusMutation.variables === s.value ? (
                    <ActivityIndicator size="small" color="#4DB6AC" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowStatusModal(false)}
              className="mt-4 items-center rounded-2xl border border-slate-200 py-3 dark:border-slate-700">
              <Text className="font-medium text-slate-600">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showPaymentDetail && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowPaymentDetail(null)}
          className="absolute inset-0 z-50 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-primary-dark">
            <Text className="text-lg font-bold text-slate-900">Detalle del Pago</Text>
            <View className="mt-4 gap-3">
              <View>
                <Text className="text-xs text-slate-500">Método</Text>
                <Text className="text-base font-semibold text-slate-900">
                  {showPaymentDetail.metodo_pago_nombre || `Método #${showPaymentDetail.metodo_pago_id}`}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-slate-500">Monto</Text>
                <Text className="text-xl font-bold text-emerald-600">
                  Bs. {fmt(showPaymentDetail.monto)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-slate-500">Fecha</Text>
                <Text className="text-sm font-medium text-slate-900">
                  {new Date(showPaymentDetail.fecha).toLocaleString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {showPaymentDetail.referencia_pago && (
                <View>
                  <Text className="text-xs text-slate-500">Referencia</Text>
                  <Text className="text-sm font-medium text-slate-900">
                    {showPaymentDetail.referencia_pago}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowPaymentDetail(null)}
              className="mt-5 items-center rounded-2xl bg-[#4DB6AC] py-3">
              <Text className="font-semibold text-white">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-rose-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
