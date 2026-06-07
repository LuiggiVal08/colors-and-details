import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import orderService from '@/services/order.service';
import paymentMethodService from '@/services/paymentMethod.service';
import { impactLight, selection } from '@/helpers/haptics';

const METHOD_CONFIG: Record<string, { icon: string; requiereRef: boolean }> = {
  efectivo: { icon: 'cash', requiereRef: false },
  tarjeta: { icon: 'card', requiereRef: false },
  transferencia: { icon: 'swap-horizontal', requiereRef: true },
  digital: { icon: 'phone-portrait', requiereRef: true },
  otro: { icon: 'ellipsis-horizontal', requiereRef: false },
};

const iconName = (icon: string) =>
  icon as 'cash' | 'card' | 'swap-horizontal' | 'phone-portrait' | 'ellipsis-horizontal';

export default function OrderPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = Number(id);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [activeMethodId, setActiveMethodId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState('');
  const [reference, setReference] = useState('');
  const [partialMode, setPartialMode] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId,
  });

  const { data: payments } = useQuery({
    queryKey: ['order-payments', orderId],
    queryFn: () => orderService.getPayments(orderId),
    enabled: !!orderId,
  });

  const { data: methods } = useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: () => paymentMethodService.getAll(1, 50),
  });

  const totalPagado = payments?.reduce((sum, p) => sum + p.monto, 0) ?? 0;
  const saldoPendiente = useMemo(
    () => Math.max(0, (order?.total ?? 0) - totalPagado),
    [order?.total, totalPagado]
  );

  const activeMethods = methods?.filter((m) => m.activo !== false) || [];
  const activeMethod = useMemo(() => {
    if (!activeMethodId || !methods) return null;
    return methods.find((m) => String(m.id) === activeMethodId) || null;
  }, [activeMethodId, methods]);
  const activeConfig = activeMethod
    ? METHOD_CONFIG[activeMethod.tipo] || { icon: 'ellipsis-horizontal', requiereRef: false }
    : null;

  const mutation = useMutation({
    mutationFn: () => {
      const montoNum = parseFloat(amountText) || 0;
      const montoStr = montoNum.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return orderService.createPayment({
        pedido_id: String(orderId),
        metodo_pago_id: String(activeMethod!.id),
        monto: montoStr,
        referencia_pago: reference.trim() || undefined,
      });
    },
    onSuccess: () => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-payments', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSnackbar({ visible: true, message: 'Pago registrado' });
      setTimeout(() => router.back(), 800);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al registrar el pago' });
    },
  });

  const handleSelectMethod = (methodId: string) => {
    impactLight();
    setActiveMethodId(methodId);
    setAmountText(partialMode ? '' : saldoPendiente.toFixed(2));
  };

  const handleTogglePartial = () => {
    selection();
    setPartialMode((v) => !v);
    setAmountText(partialMode ? saldoPendiente.toFixed(2) : '');
  };

  const handleSubmit = () => {
    const amount = parseFloat(amountText) || 0;
    if (amount <= 0) {
      setSnackbar({ visible: true, message: 'Ingresa un monto válido' });
      return;
    }
    if (amount > saldoPendiente) {
      setSnackbar({
        visible: true,
        message: 'El monto no puede ser mayor al saldo pendiente',
      });
      return;
    }
    if (activeConfig?.requiereRef && !reference.trim()) {
      setSnackbar({ visible: true, message: 'Este método requiere referencia' });
      return;
    }
    mutation.mutate();
  };

  const fmt = (n: number) =>
    n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <Stack.Screen options={{ title: 'Registrar Pago' }} />
      <ScreenLayout scrollEnabled={false} className="px-4 pt-2">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled">
          <View className="mb-4 rounded-2xl border border-[#4DB6AC]/30 bg-[#4DB6AC]/5 p-4">
            <Text className="text-xs font-medium uppercase tracking-wide text-[#4DB6AC]">
              Pedido #{orderId}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-sm text-slate-600">Total</Text>
              <Text className="text-lg font-bold text-slate-900">
                Bs. {fmt(order?.total ?? 0)}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-sm text-slate-600">Pagado</Text>
              <Text className="text-sm font-semibold text-emerald-600">Bs. {fmt(totalPagado)}</Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between border-t border-[#4DB6AC]/20 pt-1">
              <Text className="text-sm font-semibold text-slate-700">Saldo Pendiente</Text>
              <Text className="text-xl font-bold text-rose-600">Bs. {fmt(saldoPendiente)}</Text>
            </View>
          </View>

          <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:bg-primary-dark dark:border-slate-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-700">Monto a pagar</Text>
              <TouchableOpacity
                onPress={handleTogglePartial}
                className={`rounded-full px-3 py-1 ${
                  partialMode ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                <Text
                  className={`text-xs font-medium ${
                    partialMode ? 'text-amber-700' : 'text-slate-600'
                  }`}>
                  {partialMode ? 'Pago parcial' : 'Pago completo'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-2 flex-row items-center rounded-xl border border-slate-300 bg-slate-50 px-3 dark:border-slate-700 dark:bg-primary-dark">
              <Text className="text-base text-slate-500">Bs. </Text>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="decimal-pad"
                placeholder="0.00"
                className="flex-1 py-3 text-base text-slate-900"
              />
            </View>
            <View className="mt-1 flex-row gap-2">
              <TouchableOpacity
                onPress={() => setAmountText(saldoPendiente.toFixed(2))}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 dark:bg-primary-dark dark:border-slate-700">
                <Text className="text-center text-xs text-slate-600">Todo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAmountText((saldoPendiente / 2).toFixed(2))}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 dark:bg-primary-dark dark:border-slate-700">
                <Text className="text-center text-xs text-slate-600">Mitad</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Método de Pago
          </Text>
          {activeMethods.length === 0 ? (
            <View className="items-center rounded-2xl bg-amber-50 p-6">
              <Ionicons name="alert-circle-outline" size={28} color="#F59E0B" />
              <Text className="mt-2 text-center text-sm text-amber-700">
                No hay métodos de pago configurados
              </Text>
            </View>
          ) : (
            <View className="mb-4 gap-1.5">
              {activeMethods.map((method) => {
                const config =
                  METHOD_CONFIG[method.tipo] || { icon: 'ellipsis-horizontal', requiereRef: false };
                const isActive = String(method.id) === activeMethodId;
                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => handleSelectMethod(String(method.id))}
                    className={`flex-row items-center gap-3 rounded-2xl p-3.5 ${
                      isActive
                        ? 'border-2 border-[#4DB6AC] bg-[#4DB6AC]/5'
                        : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-primary-dark'
                    }`}>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#4DB6AC]/10">
                      <Ionicons name={iconName(config.icon)} size={18} color="#4DB6AC" />
                    </View>
                    <Text className="flex-1 text-sm font-medium text-slate-900">
                      {method.nombre}
                    </Text>
                    {isActive && <Ionicons name="checkmark-circle" size={20} color="#4DB6AC" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {activeMethodId && activeMethod && activeConfig?.requiereRef && (
            <View className="mb-4">
              <Text className="mb-1 text-xs text-slate-600">Referencia (requerida)</Text>
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="N° de referencia"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-primary-dark dark:border-slate-700 dark:text-white"
              />
            </View>
          )}

          <View className="mt-2 flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 items-center rounded-2xl border border-slate-200 py-3.5 dark:border-slate-700">
              <Text className="font-medium text-slate-600">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={mutation.isPending || !activeMethodId}
              className={`flex-1 items-center rounded-2xl py-3.5 ${
                !activeMethodId ? 'bg-slate-300' : 'bg-[#4DB6AC]'
              }`}>
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-bold text-white">Confirmar Pago</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenLayout>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-rose-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
