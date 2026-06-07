import { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Keyboard, useColorScheme } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import paymentMethodService from '@/services/paymentMethod.service';
import type { PaymentEntry } from '@/feature/shopping/types';
import { impactLight, selection } from '@/helpers/haptics';

interface PaymentModalProps {
  onDismiss: () => void;
  totalBs: number;
  totalSinIva: number;
  ivaMonto: number;
  onConfirm: (payments: PaymentEntry[], notas: string) => void;
  isProcessing?: boolean;
}

export interface PaymentModalRef {
  present: () => void;
  dismiss: () => void;
}

const METHOD_CONFIG: Record<string, { icon: string; requiereRef: boolean }> = {
  efectivo: { icon: 'cash', requiereRef: false },
  tarjeta: { icon: 'card', requiereRef: false },
  transferencia: { icon: 'swap-horizontal', requiereRef: true },
  digital: { icon: 'phone-portrait', requiereRef: true },
  otro: { icon: 'ellipsis-horizontal', requiereRef: false },
};

const PaymentModal = forwardRef<PaymentModalRef, PaymentModalProps>(
  ({ onDismiss, totalBs, totalSinIva, ivaMonto, onConfirm, isProcessing },
  ref) => {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [activeMethodId, setActiveMethodId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState('');
  const [reference, setReference] = useState('');
  const [notas, setNotas] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '95%'], []);
  const colorScheme = useColorScheme();

  useImperativeHandle(ref, () => ({
    present: () => {
      setPayments([]);
      setActiveMethodId(null);
      setAmountText('');
      setReference('');
      setNotas('');
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

  const { data: methods } = useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: () => paymentMethodService.getAll(1, 50),
  });

  const pending = useMemo(() => {
    const paid = payments.reduce((sum, p) => sum + p.monto, 0);
    return Math.max(0, totalBs - paid);
  }, [payments, totalBs]);

  const activeMethod = useMemo(() => {
    if (!activeMethodId || !methods) return null;
    return methods.find((m) => String(m.id) === activeMethodId) || null;
  }, [activeMethodId, methods]);

  const activeConfig = useMemo(() => {
    if (!activeMethod) return null;
    return METHOD_CONFIG[activeMethod.tipo] || { icon: 'ellipsis-horizontal', requiereRef: false };
  }, [activeMethod]);

  const change = useMemo(() => {
    if (!activeMethod || activeMethod.tipo !== 'efectivo') return 0;
    const amount = parseFloat(amountText) || 0;
    return Math.max(0, amount - pending);
  }, [activeMethod, amountText, pending]);

  const handleAddPayment = () => {
    const amount = parseFloat(amountText) || 0;
    if (amount <= 0) {
      setSnackbar({ visible: true, message: 'Ingresa un monto válido' });
      return;
    }
    if (!activeMethod) {
      setSnackbar({ visible: true, message: 'Selecciona un método de pago' });
      return;
    }
    selection();
    const requiereRef = activeConfig?.requiereRef;
    setPayments((prev) => [
      ...prev,
      {
        metodo_pago_id: Number(activeMethod.id),
        metodo_pago_nombre: activeMethod.nombre,
        monto: Math.min(amount, pending),
        referencia: requiereRef ? reference || 'N/A' : 'N/A',
      },
    ]);
    setAmountText('');
    setReference('');
    setActiveMethodId(null);
  };

  const handleRemovePayment = (index: number) => {
    selection();
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (pending > 0) {
      setSnackbar({ visible: true, message: `Faltan Bs. ${pending.toFixed(2)} por cubrir` });
      return;
    }
    impactLight();
    Keyboard.dismiss();
    onConfirm(payments, notas);
    bottomSheetRef.current?.dismiss();
  };

  const fmt = (n: number) => n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const iconName = (icon: string) =>
    icon as 'cash' | 'card' | 'swap-horizontal' | 'phone-portrait' | 'ellipsis-horizontal';

  const hasMethods = methods && methods.length > 0;
  const activeMethods = methods?.filter((m) => m.activo !== false) || [];

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        keyboardBehavior="extend"
        enablePanDownToClose={false}
        enableDismissOnClose={false}
        onDismiss={onDismiss}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}
        backgroundStyle={{ backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 48, height: 5 }}>
        <BottomSheetScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}>
          <View className="mb-3 rounded-2xl bg-[#4DB6AC]/10 p-4">
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-sm text-slate-600">Sub-Total</Text>
              <Text className="text-sm text-slate-900">Bs. {fmt(totalSinIva)}</Text>
            </View>
            <View className="flex-row items-center justify-between py-1">
              <Text className="text-sm text-slate-600">IVA</Text>
              <Text className="text-sm text-slate-900">Bs. {fmt(ivaMonto)}</Text>
            </View>
            <View className="mt-1 flex-row items-center justify-between border-t border-[#4DB6AC]/20 pt-2">
              <Text className="text-base font-bold text-slate-900">Total</Text>
              <Text className="text-xl font-bold text-slate-900">Bs. {fmt(totalBs)}</Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between border-t border-[#4DB6AC]/20 pt-2">
              <Text className="text-sm text-slate-600">Pendiente</Text>
              <Text className={`text-base font-semibold ${pending === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {pending === 0 ? '✓ Cubierto' : `Bs. ${fmt(pending)}`}
              </Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Notas adicionales</Text>
            <BottomSheetTextInput
              value={notas}
              onChangeText={setNotas}
              placeholder="Opcional..."
              multiline
              numberOfLines={2}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              textAlignVertical="top"
            />
          </View>

          {payments.length > 0 && (
            <View className="mb-3">
              <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Pagos agregados</Text>
              {payments.map((p, i) => (
                <View
                  key={i}
                  className="mb-1.5 flex-row items-center justify-between rounded-xl border border-slate-100 bg-white p-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-medium text-slate-900">{p.metodo_pago_nombre}</Text>
                    <Text className="text-xs text-slate-500">Bs. {fmt(p.monto)}</Text>
                    {p.referencia && p.referencia !== 'N/A' && (
                      <Text className="text-xs text-slate-400">Ref: {p.referencia}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleRemovePayment(i)} className="ml-2">
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {pending === 0 && payments.length > 0 && (
            <View className="mb-3 items-center rounded-2xl bg-emerald-50 p-4">
              <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              <Text className="mt-1 text-sm font-semibold text-emerald-700">Total cubierto</Text>
            </View>
          )}

          {pending > 0 && !activeMethodId && hasMethods && (
            <View className="mb-3">
              <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Método de pago</Text>
              <View className="gap-1.5">
                {activeMethods.map((method) => {
                  const config = METHOD_CONFIG[method.tipo] || { icon: 'ellipsis-horizontal', requiereRef: false };
                  return (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => {
                        selection();
                        setActiveMethodId(String(method.id));
                        setAmountText(pending.toFixed(2));
                      }}
                      className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-[#4DB6AC]/10">
                        <Ionicons name={iconName(config.icon)} size={18} color="#4DB6AC" />
                      </View>
                      <Text className="text-sm font-medium text-slate-900">{method.nombre}</Text>
                      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {pending > 0 && !hasMethods && (
            <View className="mb-3 items-center rounded-2xl bg-amber-50 p-6">
              <Ionicons name="alert-circle-outline" size={28} color="#F59E0B" />
              <Text className="mt-2 text-center text-sm text-amber-700">No hay métodos de pago configurados</Text>
            </View>
          )}

          {activeMethodId && activeMethod && pending > 0 && (
            <View className="mb-3 rounded-2xl border border-[#4DB6AC] bg-[#4DB6AC]/5 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  {activeConfig && <Ionicons name={iconName(activeConfig.icon)} size={20} color="#4DB6AC" />}
                  <Text className="text-base font-semibold text-slate-900">{activeMethod.nombre}</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveMethodId(null)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <View className="mb-3">
                <Text className="mb-1 text-xs text-slate-600">Monto (Bs.)</Text>
                <View className="flex-row items-center rounded-xl border border-slate-300 bg-white px-3">
                  <Text className="text-base text-slate-500">Bs. </Text>
                  <BottomSheetTextInput
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    className="flex-1 py-2.5 text-base text-slate-900"
                  />
                </View>
              </View>
              {activeConfig?.requiereRef && (
                <View className="mb-3">
                  <Text className="mb-1 text-xs text-slate-600">Referencia</Text>
                  <BottomSheetTextInput
                    value={reference}
                    onChangeText={setReference}
                    placeholder="N° de referencia"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
                  />
                </View>
              )}
              {activeMethod.tipo === 'efectivo' && change > 0 && (
                <View className="mb-3 rounded-xl bg-emerald-50 p-3">
                  <Text className="text-sm font-semibold text-emerald-700">Vuelto: Bs. {fmt(change)}</Text>
                </View>
              )}
              <TouchableOpacity onPress={handleAddPayment} className="items-center rounded-xl bg-[#4DB6AC] py-3">
                <Text className="font-semibold text-white">Agregar Pago</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-3 flex-row gap-3 border-t border-slate-100 pt-3">
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.dismiss()}
              className="flex-1 items-center rounded-2xl border border-slate-200 py-3.5">
              <Text className="font-medium text-slate-600">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={pending > 0 || payments.length === 0 || isProcessing}
              className={`flex-1 items-center rounded-2xl py-3.5 ${
                pending > 0 || payments.length === 0 ? 'bg-slate-300' : 'bg-[#4DB6AC]'
              }`}>
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-bold text-white">Confirmar Pago</Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-rose-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
});

PaymentModal.displayName = 'PaymentModal';

export default PaymentModal;
