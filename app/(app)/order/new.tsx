import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Snackbar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import MiniHeader from '@/components/MiniHeader';
import SelectProductModal, { type SelectProductModalRef } from '@/components/SelectProductModal';
import SelectCustomerModal, { type SelectCustomerModalRef } from '@/components/SelectCustomerModal';
import orderService from '@/services/order.service';
import ivaService from '@/services/iva.service';
import { useExchangeRateStore } from '@/store/exchangeRate';
import { useBoxRegisterStore } from '@/store/boxRegister';
import type { CartItem } from '@/feature/shopping/types';
import Card from '@/components/Card';
import DatePickerInput from '@/components/DatePickerInput';
import { impactLight, selection } from '@/helpers/haptics';

function fmtLocale(n: number): string {
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NewOrderScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);
  const [items, setItems] = useState<CartItem[]>([]);
  const [productNotes, setProductNotes] = useState<Record<number, string>>({});
  const [clienteId, setClienteId] = useState<number | undefined>();
  const [clienteNombre, setClienteNombre] = useState<string | undefined>();
  const [fechaEntrega, setFechaEntrega] = useState<Date>(defaultDate);
  const [observaciones, setObservaciones] = useState('');
  const [showCajaModal, setShowCajaModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const productModalRef = useRef<SelectProductModalRef>(null);
  const customerModalRef = useRef<SelectCustomerModalRef>(null);

  const { activeBox, loadActiveBox } = useBoxRegisterStore();

  useEffect(() => {
    loadActiveBox();
  }, [loadActiveBox]);

  const insets = useSafeAreaInsets();
  const tasa = useExchangeRateStore((state) => state.tasa);

  const { data: ivaActual } = useQuery({
    queryKey: ['iva', 'actual'],
    queryFn: () => ivaService.getActual(),
  });

  const totalUSD = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items]
  );

  const createMutation = useMutation({
    mutationFn: () => {
      const totalStr = fmtLocale(totalUSD);
      return orderService.create({
        cliente_id: String(clienteId!),
        iva_id: String(ivaActual?.id ?? '1'),
        fecha: new Date().toISOString(),
        fecha_entrega: fechaEntrega.toISOString(),
        total: totalStr,
        observaciones: observaciones || undefined,
        detalles: items.map((i) => ({
          producto_id: String(i.producto_id),
          detalle_pedido_producto: productNotes[i.producto_id] || undefined,
          cantidad: String(i.cantidad),
          precio_unitario: fmtLocale(i.precioUnitario),
          precio_pedido_producto: '0,00',
          subtotal: fmtLocale(i.subtotal),
        })),
      });
    },
    onSuccess: (order) => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.replace(`/order/${order.id}`);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al crear el pedido. Intenta de nuevo.' });
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
    setItems(
      (prev) =>
        prev
          .map((item) => {
            if (item.producto_id !== productoId) return item;
            const nuevaCantidad = item.cantidad + delta;
            if (nuevaCantidad <= 0) return null;
            return { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precioUnitario };
          })
          .filter(Boolean) as CartItem[]
    );
  }, []);

  const handleSelectCustomer = useCallback((cliente: { id: number; nombre: string }) => {
    if (cliente.id === 0) {
      setSnackbar({ visible: true, message: 'Los pedidos requieren un cliente específico' });
      return;
    }
    setClienteId(cliente.id);
    setClienteNombre(cliente.nombre);
  }, []);

  const handleCreate = useCallback(() => {
    if (!clienteId) {
      setSnackbar({ visible: true, message: 'Selecciona un cliente' });
      return;
    }
    if (items.length === 0) {
      setSnackbar({ visible: true, message: 'Agrega al menos un producto' });
      return;
    }
    if (!activeBox) {
      setShowCajaModal(true);
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (fechaEntrega <= today) {
      setSnackbar({ visible: true, message: 'La fecha de entrega debe ser posterior a hoy' });
      return;
    }
    createMutation.mutate();
  }, [clienteId, items.length, activeBox, fechaEntrega, createMutation]);

  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo Pedido' }} />
      <ScreenLayout scrollEnabled={false} className="px-4 pt-2">
        <View className="relative w-full flex-1">
          <MiniHeader />
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">Nuevo Pedido</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 dark:bg-primary-dark dark:border-slate-700">
              <Text className="text-sm text-slate-600">Cancelar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              impactLight();
              customerModalRef.current?.present();
            }}
            className="mb-3 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-primary-dark dark:border-slate-700">
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

          <DatePickerInput
            value={fechaEntrega}
            onChange={setFechaEntrega}
            label="Fecha de Entrega"
          />

          <View className="mb-3">
            <TextInput
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Observaciones (opcional)"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 dark:bg-primary-dark dark:border-slate-700 dark:text-white"
            />
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-700">Productos</Text>
            <TouchableOpacity
              onPress={() => {
                impactLight();
                productModalRef.current?.present();
              }}
              className="flex-row items-center gap-1.5 rounded-full bg-[#4DB6AC] px-3 py-1.5">
              <Text className="text-xs font-semibold text-white">Agregar</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {items.length === 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Ionicons name="cube-outline" size={56} color="#CBD5E1" />
                <Text className="mt-3 text-base text-slate-400">Sin productos</Text>
                <Text className="mt-1 text-xs text-slate-400">Agrega productos al pedido</Text>
              </View>
            ) : (
              <FlashList
                key="cart"
                style={{ flex: 1 }}
                data={items}
                keyExtractor={(item) => String(item.producto_id)}
                renderItem={({ item }) => (
                  <Card className="mb-2 rounded-2xl p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-semibold text-slate-900">{item.nombre}</Text>
                        <Text className="text-xs text-slate-500">
                          ${fmtLocale(item.precioUnitario)} c/u
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-slate-900">
                        ${fmtLocale(item.subtotal)}
                      </Text>
                    </View>
                    <TextInput
                      value={productNotes[item.producto_id] || ''}
                      onChangeText={(text) =>
                        setProductNotes((prev) => ({ ...prev, [item.producto_id]: text }))
                      }
                      placeholder="Nota del producto (color, tamaño, etc.)"
                      className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-primary-dark dark:border-slate-700"
                    />
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

          <View className="w-full" style={{ paddingBottom: insets.bottom || 16 }}>
            <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:bg-primary-dark dark:border-slate-700">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-slate-700">Total (USD)</Text>
                <Text className="text-xl font-bold text-slate-900">
                  ${fmtLocale(totalUSD)}
                </Text>
              </View>
              {tasa && (
                <View className="mt-1 flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500">Total (Bs.)</Text>
                  <Text className="text-sm font-medium text-slate-700">Bs. {fmtLocale(totalUSD * tasa)}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={createMutation.isPending || !clienteId || items.length === 0}
              className={`mt-3 items-center rounded-2xl py-4 ${
                !clienteId || items.length === 0 ? 'bg-slate-300' : 'bg-[#4DB6AC]'
              }`}>
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">Crear Pedido</Text>
              )}
            </TouchableOpacity>
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

      <Modal visible={showCajaModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 dark:bg-primary-dark">
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
              <Ionicons name="warning-outline" size={32} color="#FF5C93" />
            </View>
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Caja Requerida</Text>
            <Text className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
              No puedes crear un pedido sin una caja abierta. Dirígete al módulo de Cajas e inicia una apertura.
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
