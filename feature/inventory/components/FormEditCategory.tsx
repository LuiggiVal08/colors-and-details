import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import categoryService from '@/services/category.service';
import type { CategoryItem } from '@/feature/inventory/types';
import { ControlledInput } from '@/components/ControlledInput';
import { Stack } from 'expo-router';

interface Props {
  category: CategoryItem;
  onClose: () => void;
  onSuccess?: () => void;
}

const categorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

const FormEditCategory = ({ category, onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    defaultValues: {
      nombre: category.nombre,
      descripcion: category.descripcion ?? '',
    },
    resolver: zodResolver(categorySchema),
  });
  const updateMutation = useMutation({
    mutationFn: (data: CategoryForm) => categoryService.update(category.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      onSuccess?.();
      onClose();
    },
  });
  const onSubmit = (data: CategoryForm) => {
    updateMutation.mutate(data);
  };
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen options={{ title: 'Editar Categoría' }} />
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-slate-600">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900">Editar Categoría</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text className={`font-bold ${isSubmitting ? 'text-slate-400' : 'text-[#4DB6AC]'}`}>
            Guardar
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="p-4">
        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-wide text-slate-400">
            Información
          </Text>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
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
          </View>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FormEditCategory;
