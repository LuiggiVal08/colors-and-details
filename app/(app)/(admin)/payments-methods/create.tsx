import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Card from '@/components/Card';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm , Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentMethodFormData, paymentMethodSchema } from '@/schemas/paymentMethodSchema';
import { ControlledInput } from '@/components/ControlledInput';
import paymentMethodService from '@/services/paymentMethod.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Snackbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';


const tipos = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Digital', value: 'digital' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Otro', value: 'otro' },
];

export default function PaymentMethodCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (message: string) => setSnackbar({ visible: true, message });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(paymentMethodSchema),
    mode: 'onChange',
  });

  const createMutation = useMutation({
    mutationFn: (data: PaymentMethodFormData) => paymentMethodService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      router.back();
    },
    onError: () => {
      showError('No se pudo crear el método de pago');
    },
  });

  const onSubmit = (data: PaymentMethodFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Crear Método de Pago' }} />
      <ScreenLayout>
        <ScrollView className="w-full flex-1 p-4">
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-semibold text-slate-900">Nuevo Método de Pago</Text>

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

            <View className="mb-4">
              <Text className="mb-1 text-sm font-medium text-gray-700">Tipo</Text>
              <Controller
                control={control}
                name="tipo"
                render={({ field: { onChange, value } }) => (
                  <View className="rounded-lg border border-gray-300 bg-white dark:border-slate-700 dark:bg-primary-dark">
                    <Picker selectedValue={value} onValueChange={onChange}>
                      <Picker.Item label="Seleccione un tipo" value="" />
                      {tipos.map((tipo) => (
                        <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              {errors.tipo && <Text className="mt-1 text-xs text-red-500">{errors.tipo.message}</Text>}
            </View>

            <View className="">
              <ControlledInput
                name="comision"
                label="Comisión"
                control={control}
                error={errors.comision?.message}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
              className={`mt-4 rounded-full py-3 shadow-sm ${isValid ? 'bg-[#4DB6AC]' : 'bg-slate-300'}`}>
              <Text className="text-center font-semibold text-white">Crear Método</Text>
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
