import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Menu, Snackbar } from 'react-native-paper';
import ScreenLayout from '@/components/layout/ScreenLayout';
import productService from '@/services/product.service';
import productMovementService from '@/services/productMovement.service';
import { useExchangeRateStore } from '@/store/exchangeRate';
import { ConfirmModal } from '@/components/ConfirmModal';
import { impactLight } from '@/helpers/haptics';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tasa = useExchangeRateStore((state) => state.tasa);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [showDelete, setShowDelete] = useState(false);

  const productQuery = useQuery({
    queryKey: ['inventory', 'product', id],
    queryFn: () => productService.getById(id as string),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productService.delete(productId),
    onSuccess: () => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      setSnackbar({ visible: true, message: 'Producto eliminado' });
      setTimeout(() => router.back(), 600);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'No se pudo eliminar el producto' });
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['inventory', 'movements', 'by-product', id],
    queryFn: () => productMovementService.getAll({ producto_id: id, limit: 5 }),
    enabled: Boolean(id),
  });

  if (productQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detalle de producto' }} />
        <ScreenLayout>
          <View className="w-full items-center justify-center px-4 py-6">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        </ScreenLayout>
      </>
    );
  }

  const product = productQuery.data;

  if (!product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detalle de producto' }} />
        <ScreenLayout>
          <View className="w-full px-4 py-6">
            <View className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-50/20 dark:bg-primary-dark">
              <Text className="text-xl font-semibold text-slate-900">Producto no encontrado</Text>
              <Text className="mt-2 text-slate-500">
                Verifica que el producto exista en el inventario.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-6 items-center rounded-full bg-[#4DB6AC] px-5 py-3">
                <Text className="text-center text-base font-semibold text-white">
                  Volver al inventario
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScreenLayout>
      </>
    );
  }

  const isAgotado = product.stock <= 0;
  const isLowStock = !isAgotado && product.stock < 5;
  const precioBs = tasa ? product.precio * tasa : 0;
  const fmt = (n: number) =>
    n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalle de producto',
          headerRight: () => (
            <Menu
              visible={menuVisible}
              anchorPosition="bottom"
              onDismiss={() => setMenuVisible(false)}
              theme={{ colors: { elevation: { level2: '#fff' } } }}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} className="mr-3">
                  <Ionicons name="ellipsis-vertical" size={24} color="#4DB6AC" />
                </TouchableOpacity>
              }>
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  router.push(`/inventory/productos/${product.id}/edit`);
                }}
                leadingIcon="pencil"
                title="Editar"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  setShowDelete(true);
                }}
                leadingIcon="delete"
                title="Eliminar"
              />
            </Menu>
          ),
        }}
      />
      <ScreenLayout>
        <View className="w-full max-w-4xl px-4 py-6">
          <View className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-50/20 dark:bg-primary-dark">
            <View className="mb-6 w-full overflow-hidden rounded-3xl bg-slate-100">
              {product.imagen ? (
                <Image source={{ uri: product.imagen }} className="h-72 w-full" resizeMode="cover" />
              ) : (
                <View className="h-72 items-center justify-center">
                  <Ionicons name="image-outline" size={64} color="#94A3B8" />
                  <Text className="mt-3 text-base text-slate-500">Sin imagen disponible</Text>
                </View>
              )}
            </View>

            <View className="mb-6 flex-row items-start justify-between gap-4">
              <View className="min-w-0 flex-1">
                <Text className="text-2xl font-semibold text-slate-900">{product.nombre}</Text>
                <Text className="mt-2 text-sm text-slate-500">Código: {product.codigo}</Text>
                <Text className="text-sm text-slate-500">Categoría: {product.categoria}</Text>
                {product.descripcion ? (
                  <Text className="mt-2 text-sm italic text-slate-500">{product.descripcion}</Text>
                ) : null}
              </View>
              <View
                className={`rounded-2xl px-4 py-2 ${
                  isAgotado ? 'bg-rose-100' : isLowStock ? 'bg-amber-100' : 'bg-emerald-100'
                }`}>
                <Text
                  className={`text-sm font-semibold ${
                    isAgotado
                      ? 'text-rose-700'
                      : isLowStock
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                  }`}>
                  {isAgotado ? 'Agotado' : isLowStock ? 'Stock bajo' : 'En stock'}
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <View className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                <Text className="text-sm text-slate-500">Precio USD</Text>
                <Text className="mt-1 text-xl font-semibold text-slate-900">${fmt(product.precio)}</Text>
              </View>
              {tasa && (
                <View className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                  <Text className="text-sm text-slate-500">Precio Bs.</Text>
                  <Text className="mt-1 text-xl font-semibold text-slate-900">Bs. {fmt(precioBs)}</Text>
                </View>
              )}
              <View className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                <Text className="text-sm text-slate-500">Stock actual</Text>
                <Text
                  className={`mt-1 text-xl font-semibold ${
                    isAgotado
                      ? 'text-rose-700'
                      : isLowStock
                        ? 'text-amber-700'
                        : 'text-slate-900'
                  }`}>
                  {product.stock} unidades
                </Text>
              </View>
            </View>

            {movements.length > 0 && (
              <View className="mt-6">
                <Text className="mb-3 text-base font-semibold text-slate-900">
                  Últimos movimientos
                </Text>
                {movements.map((mov) => (
                  <View
                    key={mov.id}
                    className="mb-2 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-primary-dark">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name={mov.tipo === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle'}
                          size={16}
                          color={mov.tipo === 'entrada' ? '#059669' : '#E11D48'}
                        />
                        <Text
                          className={`text-sm font-medium ${
                            mov.tipo === 'entrada' ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                          {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </Text>
                      </View>
                      <Text className="mt-0.5 text-xs text-slate-500">
                        {new Date(mov.fecha).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                      {mov.motivo ? (
                        <Text className="mt-0.5 text-xs text-slate-400">{mov.motivo}</Text>
                      ) : null}
                    </View>
                    <Text className="text-sm font-semibold text-slate-900">
                      {mov.tipo === 'entrada' ? '+' : '-'}
                      {mov.cantidad}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/inventory/movimientos/create')}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#4DB6AC] py-3">
                <Ionicons name="swap-vertical" size={18} color="#4DB6AC" />
                <Text className="text-sm font-semibold text-[#4DB6AC]">Registrar movimiento</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-1 items-center rounded-2xl bg-[#4DB6AC] py-3">
                <Text className="text-sm font-semibold text-white">Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenLayout>

      <ConfirmModal
        visible={showDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${product.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate(product.id)}
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-emerald-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
