import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Servicio, UpdateServicioDTO } from '@/types/service';
import { serviceEditSchema, type ServiceEditFormData } from '@/schemas/serviceSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import serviceService from '@/services/service.service';
import { Snackbar } from 'react-native-paper';

interface Props {
  initialData: Servicio;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditServiceForm = ({ initialData, onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const precioActual = initialData.precio;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceEditFormData>({
    resolver: zodResolver(serviceEditSchema),
    defaultValues: {
      empresa_id: String(initialData.empresa_id),
      nombre: initialData.nombre,
      descripcion: initialData.descripcion ?? '',
      proveedor: initialData.proveedor ?? '',
      precio: precioActual || '',
      dia_corte: String(initialData.dia_corte),
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateServicioDTO) => serviceService.update(String(initialData.id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['servicio', initialData.id] });
      onSuccess?.();
      onClose();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Error al guardar';
      setSnackbar({ visible: true, message: `${msg} (${axiosErr?.response?.status || 'sin status'})` });
    },
  });

  const onSubmit = (data: ServiceEditFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Editar Servicio</Text>
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
              keyboardType="decimal-pad"
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
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}>
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};
