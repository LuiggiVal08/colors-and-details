import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Card from '@/components/Card';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceFormData, serviceSchema } from '@/schemas/serviceSchema';
import { ControlledInput } from '@/components/ControlledInput';
import serviceService from '@/services/service.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Snackbar } from 'react-native-paper';
import { useAuthStore } from '@/store/auth';

export default function ServiceCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (message: string) => setSnackbar({ visible: true, message });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    mode: 'onChange',
  });

  const createMutation = useMutation({
    mutationFn: (data: ServiceFormData) =>
      serviceService.create({
        ...data,
        empresa_id: '1',
        usuario_id: String(user?.id ?? ''),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      router.back();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showError(axiosErr?.response?.data?.message || 'No se pudo crear el servicio');
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Crear Servicio' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-semibold text-slate-900">Nuevo Servicio</Text>
            <View className="">
              <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} />
            </View>
            <View className="">
              <ControlledInput
                name="descripcion"
                label="Descripción"
                control={control}
                error={errors.descripcion?.message}
                multiline
              />
            </View>
            <View className="">
              <ControlledInput name="proveedor" label="Proveedor" control={control} error={errors.proveedor?.message} />
            </View>
            <View className="">
              <ControlledInput
                name="precio"
                label="Precio ($)"
                control={control}
                error={errors.precio?.message}
                keyboardType="numeric"
              />
            </View>
            <View className="">
              <ControlledInput
                name="dia_corte"
                label="Día de Corte"
                control={control}
                error={errors.dia_corte?.message}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              className={`mt-4 rounded-full py-3 shadow-sm ${isValid ? 'bg-[#4DB6AC]' : 'bg-slate-300'}`}>
              <Text className="text-center font-semibold text-white">Crear Servicio</Text>
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
