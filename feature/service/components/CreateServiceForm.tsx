import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateServicioDTO } from '@/types/service';
import { ServiceFormData, serviceSchema } from '@/schemas/serviceSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import serviceService from '@/services/service.service';
import { useAuthStore } from '@/store/auth';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateServiceForm = ({ onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateServicioDTO) => serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createMutation.mutate({
      ...data,
      empresa_id: '1',
      usuario_id: String(user?.id ?? ''),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Crear Servicio</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)}>
          <Text className="font-bold text-[#4DB6AC]">Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Información del Servicio</Text>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
            <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} />
            <ControlledInput
              name="descripcion"
              label="Descripción"
              control={control}
              error={errors.descripcion?.message}
              multiline
            />
            <ControlledInput name="proveedor" label="Proveedor" control={control} error={errors.proveedor?.message} />
            <ControlledInput
              name="precio"
              label="Precio ($)"
              control={control}
              error={errors.precio?.message}
              keyboardType="numeric"
            />
            <ControlledInput
              name="dia_corte"
              label="Día de Corte"
              control={control}
              error={errors.dia_corte?.message}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};
