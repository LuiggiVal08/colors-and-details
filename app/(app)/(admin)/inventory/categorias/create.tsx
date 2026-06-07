import { useState } from 'react';
import { z } from 'zod';
import { Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Card from '@/components/Card';
import { Stack, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ControlledInput } from '@/components/ControlledInput';
import ScreenLayout from '@/components/layout/ScreenLayout';
import categoryService from '@/services/category.service';
import { Snackbar } from 'react-native-paper';
import { notificationHapatics } from '@/helpers/haptics';

const categorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CreateCategoryScreen() {
  const router = useRouter();

  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const showError = (message: string) => setSnackbar({ visible: true, message });

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      notificationHapatics.success();
      router.replace('/inventory');
    },
    onError: () => {
      notificationHapatics.error();
      showError('No se pudo crear la categoría');
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  });

  const onSubmit = (data: CategoryForm) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Crear categoría' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-semibold text-slate-900">Nueva categoría</Text>
            <Text className="text-sm text-slate-500">Agrega una nueva categoría para organizar tus productos.</Text>
          </Card>

          <Card>
            <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} />
            <ControlledInput
              name="descripcion"
              label="Descripción"
              control={control}
              error={errors.descripcion?.message}
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || createCategoryMutation.isPending}
              className={`mt-4 rounded-full py-3 ${isValid && !createCategoryMutation.isPending ? 'bg-[#4DB6AC]' : 'bg-slate-300'}`}>
              <Text className="text-center text-base font-semibold text-white">Crear categoría</Text>
            </TouchableOpacity>
            {createCategoryMutation.isError && (
              <Text className="mt-3 text-sm text-rose-500">Ocurrió un error al crear la categoría.</Text>
            )}
          </Card>
        </ScrollView>
      </ScreenLayout>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        action={{ label: 'Cerrar', onPress: () => setSnackbar({ ...snackbar, visible: false }) }}
        className="bg-rose-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
