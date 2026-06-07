import { useEffect, useState } from 'react';
import { z } from 'zod';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Card from '@/components/Card';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ControlledInput } from '@/components/ControlledInput';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { useAuthStore } from '@/store/auth';
import productService from '@/services/product.service';
import productMovementService from '@/services/productMovement.service';
import { Picker } from '@react-native-picker/picker';
import { notificationHapatics } from '@/helpers/haptics';

const movementSchema = z.object({
  productoId: z.string().min(1, 'Selecciona un producto'),
  tipo: z.enum(['entrada', 'salida']),
  cantidad: z.coerce.number().min(1, 'La cantidad debe ser mayor que 0'),
  motivo: z.string().min(1, 'El motivo es obligatorio'),
});

type MovementForm = z.infer<typeof movementSchema>;

export default function CreateMovementScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const productsQuery = useQuery({
    queryKey: ['inventory', 'products', 'form'],
    queryFn: () => productService.getAll({ page: 1, limit: 100 }),
  });

  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const showError = (message: string) => setSnackbar({ visible: true, message });

  const createMovementMutation = useMutation({
    mutationFn: (payload: {
      producto_id: string;
      usuario_id: string;
      tipo: 'entrada' | 'salida';
      cantidad: string;
      observacion?: string;
    }) => productMovementService.create(payload),
    onSuccess: () => {
      notificationHapatics.success();
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product'] });
      router.replace('/inventory');
    },
    onError: () => {
      notificationHapatics.error();
      showError('No se pudo registrar el movimiento');
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<MovementForm>({
    resolver: zodResolver(movementSchema) as never,
    mode: 'onChange',
    defaultValues: {
      productoId: '',
      tipo: 'entrada',
      cantidad: 1,
      motivo: '',
    },
  });

  useEffect(() => {
    if (!productsQuery.isLoading && productsQuery.data?.length && !watch('productoId')) {
      setValue('productoId', productsQuery.data[0].id, { shouldValidate: true });
    }
  }, [productsQuery.isLoading, productsQuery.data, setValue, watch]);

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: 'Registrar movimiento' }} />
        <ScreenLayout>
          <View className="w-full max-w-3xl px-4 py-6">
            <Card>
              <Text className="mb-3 text-xl font-semibold text-slate-900">No estás autenticado</Text>
              <Text className="text-slate-600">
                Inicia sesión para registrar movimientos en el inventario.
              </Text>
            </Card>
          </View>
        </ScreenLayout>
      </>
    );
  }

  if (productsQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Registrar movimiento' }} />
        <ScreenLayout>
          <View className="w-full items-center justify-center px-4 py-6">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        </ScreenLayout>
      </>
    );
  }

  const products = productsQuery.data ?? [];
  const selectedProduct = products.find((p) => p.id === watch('productoId'));

  if (!products.length) {
    return (
      <>
        <Stack.Screen options={{ title: 'Registrar movimiento' }} />
        <ScreenLayout>
          <View className="w-full max-w-3xl px-4 py-6">
            <Card>
              <Text className="mb-3 text-xl font-semibold text-slate-900">
                No hay productos registrados
              </Text>
              <Text className="text-slate-600">
                Agrega un producto antes de registrar movimientos.
              </Text>
            </Card>
          </View>
        </ScreenLayout>
      </>
    );
  }

  const tipoActual = watch('tipo');
  const cantidadActual = Number(watch('cantidad')) || 0;
  const stockResultante =
    selectedProduct && tipoActual === 'entrada'
      ? selectedProduct.stock + cantidadActual
      : selectedProduct
        ? Math.max(0, selectedProduct.stock - cantidadActual)
        : 0;
  const stockInsuficiente = tipoActual === 'salida' && selectedProduct && cantidadActual > selectedProduct.stock;

  const onSubmit = (data: MovementForm) => {
    if (data.tipo === 'salida' && selectedProduct && data.cantidad > selectedProduct.stock) {
      showError('La cantidad supera el stock disponible');
      return;
    }
    createMovementMutation.mutate({
      producto_id: data.productoId,
      usuario_id: String(user.id),
      tipo: data.tipo,
      cantidad: String(data.cantidad),
      observacion: data.motivo,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Registrar movimiento' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-semibold text-slate-900">Nuevo movimiento</Text>
            <Text className="text-sm text-slate-500">
              Registra entradas y salidas para mantener el stock al día.
            </Text>
          </Card>

          <Card>
            <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-primary-dark">
              <Text className="mb-2 text-sm font-medium text-slate-700">Producto</Text>
              <Controller
                control={control}
                name="productoId"
                render={({ field: { onChange, value } }) => (
                  <View className="rounded-2xl bg-white dark:bg-primary-dark">
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => onChange(String(itemValue))}>
                      {products.map((product) => (
                        <Picker.Item
                          key={product.id}
                          label={`${product.codigo} · ${product.nombre} (Stock: ${product.stock})`}
                          value={product.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              {errors.productoId && (
                <Text className="mt-1 text-xs text-rose-500">{errors.productoId.message}</Text>
              )}
            </View>

            <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-primary-dark">
              <Text className="mb-2 text-sm font-medium text-slate-700">Tipo de movimiento</Text>
              <Controller
                control={control}
                name="tipo"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => onChange('entrada')}
                      className={`flex-1 items-center rounded-2xl py-3 ${
                        value === 'entrada' ? 'bg-emerald-500' : 'border border-slate-200 bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-semibold ${
                          value === 'entrada' ? 'text-white' : 'text-slate-600'
                        }`}>
                        ↑ Entrada
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onChange('salida')}
                      className={`flex-1 items-center rounded-2xl py-3 ${
                        value === 'salida' ? 'bg-rose-500' : 'border border-slate-200 bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-semibold ${
                          value === 'salida' ? 'text-white' : 'text-slate-600'
                        }`}>
                        ↓ Salida
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            <ControlledInput
              name="cantidad"
              label="Cantidad"
              control={control}
              error={errors.cantidad?.message}
              keyboardType="numeric"
            />
            <ControlledInput
              name="motivo"
              label="Motivo"
              control={control}
              error={errors.motivo?.message}
              multiline
            />

            {selectedProduct && (
              <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-slate-500">Stock actual</Text>
                    <Text className="text-base font-semibold text-slate-900">
                      {selectedProduct.stock}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
                  <View className="items-end">
                    <Text className="text-xs text-slate-500">Stock resultante</Text>
                    <Text
                      className={`text-base font-semibold ${
                        stockInsuficiente ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                      {stockResultante}
                    </Text>
                  </View>
                </View>
                {stockInsuficiente && (
                  <Text className="mt-2 text-xs text-rose-600">
                    La cantidad supera el stock disponible
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || createMovementMutation.isPending || stockInsuficiente}
              className={`mt-4 rounded-full py-3 ${
                !isValid || createMovementMutation.isPending || stockInsuficiente
                  ? 'bg-slate-300'
                  : 'bg-[#4DB6AC]'
              }`}>
              {createMovementMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">
                  Registrar movimiento
                </Text>
              )}
            </TouchableOpacity>
          </Card>
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
