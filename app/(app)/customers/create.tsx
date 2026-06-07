import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Card from '@/components/Card';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientFormData, clientSchema } from '@/schemas/clientSchema';
import { ControlledInput } from '@/components/ControlledInput';
import clientService from '@/services/client.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Format } from '@/helpers/Formats';
import { Snackbar } from 'react-native-paper';
import { Client } from '@/types/client';
import { AxiosError } from 'axios';
interface ApiError {
  message: string;
}
export default function CustomerCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (message: string) => setSnackbar({ visible: true, message });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
  });

  const createMutation = useMutation<Client, AxiosError<ApiError>, ClientFormData>({
    mutationFn: (data: ClientFormData) => clientService.create({ ...data, activo: data.activo ?? true }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      router.push(`/customers/${data.id}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error de conexión';
      showError(message);
    },
  });

  const onSubmit = (data: ClientFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Crear Cliente' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-6 text-2xl font-bold text-slate-900">Nuevo Cliente</Text>

            <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} onChangeText={Format.name} />
            <ControlledInput name="apellido" label="Apellido" control={control} error={errors.apellido?.message} onChangeText={Format.name} />
            <ControlledInput name="cedula" label="Cédula" control={control} error={errors.cedula?.message} keyboardType="numeric" onChangeText={Format.dni} />
            <ControlledInput name="telefono" label="Teléfono" control={control} error={errors.telefono?.message} keyboardType="phone-pad" onChangeText={Format.phone} />
            <ControlledInput name="email" label="Correo Electrónico" control={control} error={errors.email?.message} keyboardType="email-address" onChangeText={Format.email} />
            <ControlledInput name="direccion" label="Dirección" control={control} error={errors.direccion?.message} multiline />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              className={`mt-4 rounded-full py-3 ${isValid ? 'bg-[#4DB6AC]' : 'bg-slate-300'}`}>
              <Text className="text-center font-semibold text-white">Crear Cliente</Text>
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
