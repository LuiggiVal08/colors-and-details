import { useEffect, useState } from 'react';
import { z } from 'zod';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Snackbar, ActivityIndicator } from 'react-native-paper';
import { ControlledInput } from '@/components/ControlledInput';
import ScreenLayout from '@/components/layout/ScreenLayout';
import categoryService from '@/services/category.service';
import productService from '@/services/product.service';
import Card from '@/components/Card';
import { notificationHapatics } from '@/helpers/haptics';

const productSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria_id: z.string().min(1, 'Selecciona una categoría'),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function CreateProductScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['inventory', 'categories', 'form'],
    queryFn: () => categoryService.getAll({ page: 1, limit: 100 }),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const showError = (message: string) => setSnackbar({ visible: true, message });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permite acceso a la galería para subir una imagen');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const createProductMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      notificationHapatics.success();
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      router.replace('/inventory');
    },
    onError: () => {
      notificationHapatics.error();
      showError('No se pudo crear el producto');
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as never,
    mode: 'onChange',
    defaultValues: {
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      precio: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading && categoriesQuery.data?.length) {
      setValue('categoria_id', categoriesQuery.data[0].id, { shouldValidate: true });
    }
  }, [categoriesQuery.isLoading, categoriesQuery.data, setValue]);

  const onSubmit = (data: ProductForm) => {
    const formData = new FormData();
    formData.append('codigo', data.codigo);
    formData.append('nombre', data.nombre);
    formData.append('categoria_id', data.categoria_id);
    formData.append('precio', String(data.precio));
    formData.append('stock', String(data.stock));
    if (data.descripcion) formData.append('descripcion', data.descripcion);

    if (selectedImage) {
      const fileExtension = selectedImage.split('.').pop() ?? 'jpg';
      const fileType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      formData.append('imagen', {
        uri: selectedImage,
        name: `producto.${fileExtension}`,
        type: fileType,
      } as unknown as Blob);
    }

    createProductMutation.mutate(formData);
  };

  if (categoriesQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Crear producto' }} />
        <ScreenLayout>
          <View className="w-full items-center justify-center px-4 py-6">
            <Text className="text-slate-700">Cargando categorías...</Text>
          </View>
        </ScreenLayout>
      </>
    );
  }

  const categories = categoriesQuery.data ?? [];

  if (!categories.length) {
    return (
      <>
        <Stack.Screen options={{ title: 'Crear producto' }} />
        <ScreenLayout>
          <View className="w-full max-w-3xl px-4 py-6">
            <Card>
              <Text className="mb-3 text-xl font-semibold text-slate-900">Necesitas una categoría</Text>
              <Text className="text-slate-600">
                Crea primero una categoría antes de agregar productos.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/inventory/categorias/create')}
                className="mt-6 rounded-full bg-[#4DB6AC] px-5 py-3">
                <Text className="text-center font-semibold text-white">Crear categoría</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Crear producto' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-semibold text-slate-900">Nuevo producto</Text>
            <Text className="text-sm text-slate-500">
              Agrega un producto y mantenlo disponible para movimientos.
            </Text>
          </Card>

          <Card>
            <ControlledInput name="codigo" label="Código" control={control} error={errors.codigo?.message} />
            <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} />
            <ControlledInput
              name="descripcion"
              label="Descripción"
              control={control}
              error={errors.descripcion?.message}
              multiline
            />

            <View className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-primary-dark">
              <Text className="mb-3 text-sm font-semibold text-slate-700">Imagen del producto</Text>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} className="mb-3 h-52 w-full rounded-3xl" resizeMode="cover" />
              ) : (
                <View className="mb-3 flex h-52 w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-primary-dark">
                  <Ionicons name="image-outline" size={56} color="#94A3B8" />
                  <Text className="mt-3 text-sm text-slate-500">Selecciona una imagen para previsualizarla</Text>
                </View>
              )}
              <View className="flex-row flex-wrap items-center gap-3">
                <TouchableOpacity onPress={pickImage} className="rounded-full bg-[#4DB6AC] px-5 py-3">
                  <Text className="text-base font-semibold text-white">
                    {selectedImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </Text>
                </TouchableOpacity>
                {selectedImage ? (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="rounded-full border border-slate-300 bg-white px-5 py-3">
                    <Text className="text-base font-semibold text-slate-900">Eliminar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-primary-dark">
              <Text className="mb-2 text-sm font-medium text-slate-700">Categoría</Text>
              <Controller
                control={control}
                name="categoria_id"
                render={({ field: { onChange, value } }) => (
                  <View className="rounded-2xl bg-white">
                    <Picker selectedValue={value} onValueChange={onChange}>
                      {categories.map((category) => (
                        <Picker.Item key={category.id} label={category.nombre} value={category.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              {errors.categoria_id && (
                <Text className="mt-1 text-xs text-rose-500">{errors.categoria_id.message}</Text>
              )}
            </View>

            <ControlledInput
              name="precio"
              label="Precio USD"
              control={control}
              error={errors.precio?.message}
              keyboardType="numeric"
            />
            <ControlledInput
              name="stock"
              label="Stock inicial"
              control={control}
              error={errors.stock?.message}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || createProductMutation.isPending}
              className={`mt-4 rounded-full py-3 ${
                isValid && !createProductMutation.isPending ? 'bg-[#4DB6AC]' : 'bg-slate-300'
              }`}>
              {createProductMutation.isPending ? (
                <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-base font-semibold text-white">Crear producto</Text>
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
