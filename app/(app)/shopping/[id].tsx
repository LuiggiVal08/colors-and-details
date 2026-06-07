import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import ScreenLayout from '@/components/layout/ScreenLayout';
import shoppingService from '@/services/shopping.service';
import { impactLight } from '@/helpers/haptics';
import Card from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [sharing, setSharing] = useState(false);

  const saleId = Number(id);
  const { data: sale, isLoading } = useQuery({
    queryKey: ['shopping', 'detail', saleId],
    queryFn: () => shoppingService.getById(saleId),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detalle de Venta' }} />
        <ScreenLayout>
          <View className="w-full px-4 py-6">
            <SkeletonLoader count={1} variant="card" height={200} />
            <SkeletonLoader count={1} variant="card" height={120} />
          </View>
        </ScreenLayout>
      </>
    );
  }

  const getPaymentIcon = (nombre?: string) => {
    if (!nombre) return 'cash-outline';
    const lower = nombre.toLowerCase();
    if (lower.includes('efectivo')) return 'cash-outline';
    if (lower.includes('tarjeta')) return 'card-outline';
    if (lower.includes('transfer')) return 'swap-horizontal-outline';
    if (lower.includes('digital')) return 'phone-portrait-outline';
    return 'ellipsis-horizontal-outline';
  };

  const handleShare = async () => {
    if (!sale) return;
    setSharing(true);
    try {
      const line = (s: string) => s + '\n';
      let text = '';
      text += line('╔══════════════════════════════╗');
      text += line('║     COMPROBANTE DE VENTA     ║');
      text += line('╚══════════════════════════════╝');
      text += line('');
      text += line(`Venta #${sale.id}`);
      text += line(`Fecha: ${new Date(sale.fecha).toLocaleString('es-VE')}`);
      text += line(`Cliente: ${sale.cliente_nombre || 'Cliente Genérico'}`);
      if (sale.observaciones) text += line(`Nota: ${sale.observaciones}`);
      text += line('');
      text += line('--- Productos ---');
      sale.detalles?.forEach((d) => {
        text += line(`  ${d.producto_nombre || `Prod #${d.producto_id}`} x${d.cantidad}  Bs. ${(d.subtotal || 0).toLocaleString('es-VE')}`);
      });
      text += line('');
      text += line(`TOTAL: Bs. ${((sale.total as number) || 0).toLocaleString('es-VE')}`);
      text += line('');
      if (sale.pagos && sale.pagos.length > 0) {
        text += line('--- Pagos ---');
        sale.pagos.forEach((p) => {
          text += line(`  ${p.metodo_pago_nombre || 'Pago'}: Bs. ${(p.monto || 0).toLocaleString('es-VE')}`);
          if (p.referencia_pago) text += line(`    Ref: ${p.referencia_pago}`);
        });
      }
      text += line('');
      text += line('Gracias por su compra');

      const file = new File(Paths.cache, `venta_${sale.id}.txt`);
      await file.write(text);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: 'Compartir comprobante' });
    } catch {
      setSnackbar({ visible: true, message: 'Error al compartir comprobante' });
    } finally {
      setSharing(false);
    }
  };

  if (!sale) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detalle de Venta' }} />
        <ScreenLayout>
          <View className="px-4 py-6">
            <Card className="mb-4">
              <Text className="mb-4 text-center text-lg font-semibold text-slate-900">Venta no encontrada</Text>
              <Text className="mb-6 text-center text-sm text-slate-500">
                La venta que buscas no existe o ha sido eliminada.
              </Text>
              <TouchableOpacity onPress={() => router.back()} className="w-full items-center rounded-full bg-[#4DB6AC] py-3">
                <Text className="text-center font-semibold text-white">Volver</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Venta #${sale.id}` }} />
      <ScreenLayout>
        <View className="flex-1 w-full px-4 py-6">
          <Card className="mb-4">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-slate-900">Venta #{sale.id}</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  {new Date(sale.fecha).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View className="rounded-2xl bg-emerald-100 px-4 py-2">
                <Text className="font-semibold text-emerald-700">Completado</Text>
              </View>
            </View>

            <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Ionicons name="person-outline" size={22} color="#64748B" />
              <Text className="text-base font-medium text-slate-900">
                {sale.cliente_nombre || 'Cliente Genérico'}
              </Text>
            </View>

            {sale.observaciones && (
              <Text className="mb-4 text-sm italic text-slate-500">Nota: {sale.observaciones}</Text>
            )}

            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-base text-slate-600">Productos</Text>
              <Text className="text-base text-slate-600">Subtotal</Text>
            </View>

            {sale.detalles?.map((detalle, i) => (
              <View
                key={i}
                className="flex-row items-center justify-between border-b border-slate-100 py-3 dark:border-slate-700">
                <View className="min-w-0 flex-1">
                  <Text className="font-medium text-slate-900">
                    {detalle.producto_nombre || `Producto #${detalle.producto_id}`}
                  </Text>
                  <Text className="text-sm text-slate-500">x{detalle.cantidad}</Text>
                </View>
                <Text className="font-medium text-slate-900">
                  Bs. {(detalle.subtotal || 0).toLocaleString('es-VE')}
                </Text>
              </View>
            ))}

            <View className="mt-4 flex-row items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
              <Text className="text-lg font-bold text-slate-900">Total</Text>
              <Text className="text-2xl font-bold text-slate-900">
                Bs. {((sale.total as number) || 0).toLocaleString('es-VE')}
              </Text>
            </View>
          </Card>

          {sale.pagos && sale.pagos.length > 0 && (
            <Card className="mb-4">
              <Text className="mb-3 text-lg font-bold text-slate-900">Pagos</Text>
              {sale.pagos.map((pago, i) => (
                <View key={i} className="flex-row items-center justify-between border-b border-slate-100 py-2 dark:border-slate-700">
                  <View className="flex-row items-center gap-2">
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-[#4DB6AC]/10">
                      <Ionicons name={getPaymentIcon(pago.metodo_pago_nombre)} size={14} color="#4DB6AC" />
                    </View>
                    <Text className="text-slate-600">
                      {pago.metodo_pago_nombre || `Pago #${pago.metodo_pago_id}`}
                    </Text>
                  </View>
                  <Text className="font-medium text-slate-900">
                    Bs. {(pago.monto || 0).toLocaleString('es-VE')}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleShare}
              disabled={sharing}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#4DB6AC] py-4">
              {sharing ? (
                <ActivityIndicator size="small" color="#4DB6AC" />
              ) : (
                <Ionicons name="share-outline" size={20} color="#4DB6AC" />
              )}
              <Text className="font-bold text-[#4DB6AC]">Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                impactLight();
                router.push('/(tabs)/shopping');
              }}
              className="flex-1 items-center rounded-2xl bg-[#4DB6AC] py-4">
              <Text className="font-bold text-white">Nueva Venta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenLayout>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-error">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
