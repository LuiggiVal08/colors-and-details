import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import SelectProductModal, { type SelectProductModalRef } from '@/components/SelectProductModal';
import SelectCustomerModal, { type SelectCustomerModalRef } from '@/components/SelectCustomerModal';
import PaymentModal, { type PaymentModalRef } from '@/components/PaymentModal';
import shoppingService from '@/services/shopping.service';
import MiniHeader from '@/components/MiniHeader';
import { useExchangeRateStore } from '@/store/exchangeRate';
import { useIVAStore } from '@/store/iva';
import { useBoxRegisterStore } from '@/store/boxRegister';
import type { CartItem, PaymentEntry } from '@/feature/shopping/types';
import { impactLight, selection } from '@/helpers/haptics';
import Card from '@/components/Card';

export default function ShoppingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CartItem[]>([]);
  const [clienteId, setClienteId] = useState<number | undefined>();
  const [clienteNombre, setClienteNombre] = useState<string | undefined>();
  const [showCajaModal, setShowCajaModal] = useState(false);
  const paymentModalRef = useRef<PaymentModalRef>(null);
  const productModalRef = useRef<SelectProductModalRef>(null);
  const customerModalRef = useRef<SelectCustomerModalRef>(null);

  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { activeBox, loadActiveBox } = useBoxRegisterStore();

  useEffect(() => {
    loadActiveBox();
  }, [loadActiveBox]);

  const totalUSD = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const tasa = useExchangeRateStore((state) => state.tasa);
  const tasaId = useExchangeRateStore((state) => state.tasaId);
  const ivaPorcentaje = useIVAStore((state) => state.porcentaje);
  const ivaId = useIVAStore((state) => state.id);
  const totalBs = tasa ? totalUSD * tasa : 0;
  const ivaMonto = ivaPorcentaje ? totalBs * (ivaPorcentaje / 100) : 0;
  const totalConIva = totalBs + ivaMonto;

  const toStr = (n: number) => n.toFixed(2).replace('.', ',');

  const createSale = useMutation({
    mutationFn: ({ payments, saleNotas }: { payments: PaymentEntry[]; saleNotas?: string }) =>
      shoppingService.create({
        cliente_id: clienteId ? String(clienteId) : undefined,
        usuario_id: '',
        fecha: new Date().toISOString(),
        total: toStr(totalUSD),
        iva_id: ivaId ? String(ivaId) : undefined,
        observaciones: saleNotas,
        detalles: items.map((i) => ({
          producto_id: String(i.producto_id),
          cantidad: String(i.cantidad),
          precio_unitario: toStr(i.precioUnitario),
          subtotal: toStr(i.subtotal),
        })),
        pagos: payments.map((p) => ({
          metodo_pago_id: String(p.metodo_pago_id),
          monto: toStr(tasa && tasa > 0 ? p.monto / tasa : p.monto),
          referencia_pago: p.referencia || undefined,
          tasa_id: tasaId ? String(tasaId) : undefined,
          fecha: new Date().toISOString(),
        })),
      }),
    onSuccess: (result) => {
      const sale = (result as any)?.venta || result;
      queryClient.invalidateQueries({ queryKey: ['shopping'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setItems([]);
      setClienteId(undefined);
      setClienteNombre(undefined);
      if (sale?.id) router.push(`/shopping/${sale.id}`);
    },
    onError: (error: Error) => {
      const msg =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error?.message ||
        error?.message ||
        'Error al crear la venta. Intenta de nuevo.';
      setSnackbar({ visible: true, message: msg });
    },
  });

  const handleAddItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.findIndex((i) => i.producto_id === item.producto_id);
      if (existing >= 0) {
        const updated = [...prev];
        const current = updated[existing];
        updated[existing] = {
          ...current,
          cantidad: current.cantidad + item.cantidad,
          subtotal: (current.cantidad + item.cantidad) * current.precioUnitario,
        };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const handleUpdateQty = useCallback((productoId: number, delta: number) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.producto_id === productoId);
      if (idx < 0) return prev;
      const current = prev[idx];
      const nuevaCantidad = current.cantidad + delta;
      if (nuevaCantidad <= 0) return prev.filter((_, i) => i !== idx);
      const updated = [...prev];
      updated[idx] = {
        ...current,
        cantidad: nuevaCantidad,
        subtotal: nuevaCantidad * current.precioUnitario,
      };
      return updated;
    });
  }, []);

  const handleSelectCustomer = useCallback((customer: { id: number; nombre: string }) => {
    setClienteId(customer.id);
    setClienteNombre(customer.nombre);
  }, []);

  const handleOpenPayment = useCallback(() => {
    impactLight();
    if (items.length === 0) {
      setSnackbar({ visible: true, message: 'Agrega al menos un producto' });
      return;
    }
    if (!activeBox) {
      setShowCajaModal(true);
      return;
    }
    paymentModalRef.current?.present();
  }, [items.length, activeBox]);

  const handleConfirmPayment = useCallback(
    (payments: PaymentEntry[], notas: string) => {
      createSale.mutate({ payments, saleNotas: notas || undefined });
    },
    [createSale]
  );

  const fmt = (n: number) => n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <ScreenLayout className="px-4 pt-2" scrollEnabled={false}>
        <View className="relative w-full flex-1">
          <MiniHeader />
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">Nueva Venta</Text>
            <TouchableOpacity
              onPress={() => router.push('/shopping')}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:bg-primary-dark dark:border-slate-700">
              <Text className="text-sm text-slate-600">Historial</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              impactLight();
              customerModalRef.current?.present();
            }}
            className="mb-3 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
            <Ionicons name="person-outline" size={20} color="#4DB6AC" />
            <Text className={clienteNombre ? 'font-medium text-slate-900' : 'text-slate-500'}>
              {clienteNombre || 'Seleccionar cliente'}
            </Text>
            {clienteNombre && (
              <TouchableOpacity
                onPress={() => {
                  setClienteId(undefined);
                  setClienteNombre(undefined);
                }}
                className="ml-auto">
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View className="flex-1">
            {items.length === 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Ionicons name="cart-outline" size={56} color="#CBD5E1" />
                <Text className="mt-3 text-base text-slate-400">Carrito vacío</Text>
                <Text className="mt-1 text-xs text-slate-400">Agrega productos para comenzar</Text>
              </View>
            ) : (
              <FlashList
                style={{ flex: 1 }}
                data={items}
                estimatedItemSize={76}
                keyExtractor={(item) => String(item.producto_id)}
                renderItem={({ item }) => (
                  <Card className="mb-2 rounded-2xl p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-semibold text-slate-900">{item.nombre}</Text>
                        <Text className="text-xs text-slate-500">
                          ${item.precioUnitario.toLocaleString('es-VE')} c/u
                          {tasa ? <Text className="text-slate-400"> Bs. {fmt(item.precioUnitario * tasa)}</Text> : null}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-slate-900">
                        Bs. {fmt(item.subtotal * (tasa || 1))}
                      </Text>
                    </View>
                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                          onPress={() => {
                            selection();
                            handleUpdateQty(item.producto_id, -1);
                          }}
                          className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                          <Ionicons name="remove" size={14} color="#475569" />
                        </TouchableOpacity>
                        <Text className="min-w-[24px] text-center font-semibold text-slate-900">
                          {item.cantidad}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            selection();
                            handleUpdateQty(item.producto_id, 1);
                          }}
                          className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                          <Ionicons name="add" size={14} color="#475569" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          selection();
                          handleUpdateQty(item.producto_id, -item.cantidad);
                        }}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
              />
            )}
          </View>

          <View className="w-full pb-2">
            {items.length > 0 && (
              <View className="mb-2">
                <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:bg-primary-dark dark:border-slate-700">
                  <View className="flex-row items-center justify-between py-1">
                    <Text className="text-sm text-slate-600">Sub-Total</Text>
                    <Text className="text-sm text-slate-900">Bs. {fmt(totalBs)}</Text>
                  </View>
                  <View className="flex-row items-center justify-between py-1">
                    <Text className="text-sm text-slate-600">IVA{ivaPorcentaje ? ` (${ivaPorcentaje}%)` : ''}</Text>
                    <Text className="text-sm text-slate-900">Bs. {fmt(ivaMonto)}</Text>
                  </View>
                  <View className="mt-1 flex-row items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700">
                    <Text className="text-base font-bold text-slate-900">Total</Text>
                    <View className="items-end">
                      <Text className="text-base font-bold text-slate-900">Bs. {fmt(totalConIva)}</Text>
                      {tasa && (
                        <Text className="text-xs text-slate-500">
                          ${totalUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:bg-primary-dark dark:border-slate-700">
              <TouchableOpacity
                onPress={() => {
                  impactLight();
                  productModalRef.current?.present();
                }}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#4DB6AC] py-[18px]">
                <Ionicons name="add-circle-outline" size={20} color="#4DB6AC" />
                <Text className="font-medium text-[#4DB6AC]">Producto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenPayment}
                disabled={items.length === 0}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-[18px] ${items.length === 0 ? 'bg-slate-400' : 'bg-[#4DB6AC]'}`}>
                <Text className="font-bold text-white">Cobrar</Text>
                {items.length > 0 && (
                  <View className="rounded-full bg-white/25 px-2 py-0.5">
                    <Text className="text-xs font-bold text-white">{items.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenLayout>

      <SelectProductModal
        ref={productModalRef}
        onDismiss={() => {}}
        onSelect={handleAddItem}
        existingIds={items.map((i) => i.producto_id)}
      />

      <SelectCustomerModal
        ref={customerModalRef}
        onDismiss={() => {}}
        onSelect={handleSelectCustomer}
      />

      <PaymentModal
        ref={paymentModalRef}
        onDismiss={() => {}}
        totalBs={totalConIva}
        totalSinIva={totalBs}
        ivaMonto={ivaMonto}
        onConfirm={handleConfirmPayment}
        isProcessing={createSale.isPending}
      />

      <Modal visible={showCajaModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-primary-dark">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
              <Ionicons name="warning-outline" size={32} color="#FF5C93" />
            </View>
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Caja Requerida</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
              No puedes realizar una venta sin una caja abierta. Dirígete al módulo de Cajas e inicia una apertura.
            </Text>
            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowCajaModal(false)}
                className="flex-1 items-center rounded-2xl border border-slate-200 py-3 dark:border-slate-700">
                <Text className="font-medium text-slate-600 dark:text-slate-300">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCajaModal(false);
                  router.push('/box-register');
                }}
                className="flex-1 items-center rounded-2xl bg-info py-3">
                <Text className="font-bold text-white">Ir a Cajas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-rose-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
