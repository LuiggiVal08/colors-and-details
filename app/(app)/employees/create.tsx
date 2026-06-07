import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeFormData, employeeSchema } from '@/schemas/employeeSchema';
import { ControlledInput } from '@/components/ControlledInput';
import employeeService from '@/services/employee.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import { Format } from '@/helpers/Formats';
import { Snackbar } from 'react-native-paper';
import { Employee } from '@/types/employee';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
}

export default function EmployeeCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (message: string) => setSnackbar({ visible: true, message });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
  });

  const createMutation = useMutation<Employee, AxiosError<ApiError>, EmployeeFormData>({
    mutationFn: (data: EmployeeFormData) =>
      employeeService.create({ ...data, activo: data.activo ?? true, empresa_id: 1 }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      router.push(`/employees/${data.id}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error de conexión';
      showError(message);
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Crear Empleado' }} />
      <ScreenLayout>
        <ScrollView className="w-full max-w-5xl px-4 py-6">
          <Card className="mb-6">
            <Text className="mb-4 text-2xl font-bold text-slate-900">Nuevo Empleado</Text>
            <Text className="text-slate-600">Ingresa los datos del nuevo empleado.</Text>
          </Card>

          <Card className="mb-6">
            <Text className="mb-4 text-xl font-bold text-slate-900">Información Personal</Text>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="nombre"
                label="Nombre"
                placeholder="Ingresa el nombre"
                error={errors.nombre?.message}
                onChangeText={(text) => Format.name(text)}
              />
            </View>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="apellido"
                label="Apellido"
                placeholder="Ingresa el apellido"
                error={errors.apellido?.message}
                onChangeText={(text) => Format.name(text)}
              />
            </View>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="cedula"
                label="Cédula"
                placeholder="Ingresa la cédula"
                keyboardType="numeric"
                error={errors.cedula?.message}
                onChangeText={(text) => Format.dni(text)}
              />
            </View>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="telefono"
                label="Teléfono"
                placeholder="Ingresa el teléfono"
                keyboardType="phone-pad"
                error={errors.telefono?.message}
              />
            </View>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="email"
                label="Email"
                placeholder="Ingresa el email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            </View>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="direccion"
                label="Dirección"
                placeholder="Ingresa la dirección"
                error={errors.direccion?.message}
              />
            </View>

            <View className="mb-4">
              <ControlledInput
                control={control}
                name="salario_base"
                label="Salario Base"
                placeholder="Ingresa el salario base"
                keyboardType="numeric"
                error={errors.salario_base?.message}
              />
            </View>
          </Card>

          <View className="mb-6 flex-row gap-4">
            <TouchableOpacity onPress={() => router.back()} className="flex-1 rounded-2xl bg-slate-200 py-4">
              <Text className="text-center text-lg font-semibold text-slate-700">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || createMutation.isPending}
              className="flex-1 rounded-2xl bg-[#4DB6AC] py-4 disabled:opacity-50">
              <Text className="text-center text-lg font-semibold text-white">
                {createMutation.isPending ? 'Creando...' : 'Crear Empleado'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenLayout>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => setSnackbar({ visible: false, message: '' }),
        }}>
        {snackbar.message}
      </Snackbar>
    </>
  );
}
