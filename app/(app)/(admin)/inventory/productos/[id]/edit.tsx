import { useEffect, useState } from 'react';
import { z } from 'zod';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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

const productSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria_id: z.string().min(1, 'Selecciona una categoría'),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const showError = (message: string) => setSnackbar({ visible: true, message });

  const productQuery = useQuery({
    queryKey: ['inventory', 'product', id],
    queryFn: () => productService.getById(id as string),
    enabled: Boolean(id),
  });

  const categoriesQuery = useQuery({
    queryKey: ['inventory', 'categories', 'form'],
    queryFn: () => categoryService.getAll({ page: 1, limit: 100 }),
  });

  const {
    control,
    handleSubmit,
    reset,
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
    },
  });

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      reset({
        codigo: p.codigo,
        nombre: p.nombre,
        descripcion: p.descripcion ?? '',
        categoria_id: p.categoriaId,
        precio: p.precio,
      });
      setSelectedImage(p.imagen ?? null);
    }
  }, [productQuery.data, reset]);

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

  const updateMutation = useMutation({
    mutationFn: (payload: FormData) => productService.update(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', id] });
      router.back();
    },
    onError: () => {
      showError('No se pudo actualizar el producto');
    },
  });

  const onSubmit = (data: ProductForm) => {
    const formData = new FormData();
    formData.append('codigo', data.codigo);
    formData.append('nombre', data.nombre);
    formData.append('categoria_id', data.categoria_id);
    formData.append('precio', String(data.precio));
    if (data.descripcion) formData.append('descripcion', data.descripcion);

    if (selectedImage && selectedImage !== productQuery.data?.imagen) {
      const fileExtension = selectedImage.split('.').pop() ?? 'jpg';
      const fileType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      formData.append('imagen', {
        uri: selectedImage,
        name: `producto.${fileExtension}`,
        type: fileType,
      } as unknown as Blob);
    }

    updateMutation.mutate(formData);
  };

  if (productQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Editar producto' }} />
        <ScreenLayout>
          <View className="w-full items-center justify-center px-4 py-6">
            <ActivityIndicator size="large" color="#4DB6AC" />
          </View>
        </ScreenLayout>
      </>
    );
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <>
      <Stack.Screen options={{ title: 'Editar producto' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-semibold text-slate-900">Editar producto</Text>
            <Text className="text-sm text-slate-500">Modifica los datos del producto.</Text>
            <Text className="mt-1 text-xs text-amber-600">
              El stock se modifica registrando un movimiento de inventario.
            </Text>
          </Card>

          <Card>
            <ControlledInput
              name="codigo"
              label="Código"
              control={control}
              error={errors.codigo?.message}
            />
            <ControlledInput
              name="nombre"
              label="Nombre"
              control={control}
              error={errors.nombre?.message}
            />
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
                <Image
                  source={{ uri: selectedImage }}
                  className="mb-3 h-52 w-full rounded-3xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="mb-3 flex h-52 w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-primary-dark">
                  <Ionicons name="image-outline" size={56} color="#94A3B8" />
                  <Text className="mt-3 text-sm text-slate-500">
                    Selecciona una imagen para previsualizarla
                  </Text>
                </View>
              )}
              <View className="flex-row flex-wrap items-center gap-3">
                <TouchableOpacity
                  onPress={pickImage}
                  className="rounded-full bg-[#4DB6AC] px-5 py-3">
                  <Text className="text-base font-semibold text-white">
                    {selectedImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </Text>
                </TouchableOpacity>
                {selectedImage ? (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="rounded-full border border-slate-300 bg-white px-5 py-3">
                    <Text className="text-base font-semibold text-slate-900">Quitar</Text>
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
                        <Picker.Item
                          key={category.id}
                          label={category.nombre}
                          value={category.id}
                        />
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

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || updateMutation.isPending}
              className={`mt-4 rounded-full py-3 ${
                isValid && !updateMutation.isPending ? 'bg-[#4DB6AC]' : 'bg-slate-300'
              }`}>
              <Text className="text-center text-base font-semibold text-white">
                {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Text>
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
