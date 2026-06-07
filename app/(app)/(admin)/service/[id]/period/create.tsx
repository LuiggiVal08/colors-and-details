import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import servicePeriodService from '@/services/servicePeriod.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import { Snackbar, TextInput } from 'react-native-paper';

const periodSchema = z.object({
  monto: z.string().min(1, 'Ingrese el monto'),
});

type PeriodForm = z.infer<typeof periodSchema>;

export default function ServicePeriodCreate() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const servicioId = Number(id);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PeriodForm>({
    resolver: zodResolver(periodSchema),
    defaultValues: { monto: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: { servicio_empresa_id: number; mes: number; anualidad: number; amount_due: number }) =>
      servicePeriodService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-periods'] });
      setSnackbar({ visible: true, message: 'Periodo creado correctamente' });
      setTimeout(() => router.back(), 1200);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Error al crear periodo';
      setSnackbar({ visible: true, message: `${msg} (${axiosErr?.response?.status || 'sin status'})` });
    },
  });

  const onSubmit = (form: PeriodForm) => {
    const amount = parseFloat(form.monto);
    const anio = parseInt(year, 10);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({ visible: true, message: 'Ingrese un monto valido' });
      return;
    }
    if (isNaN(anio) || anio < 2020) {
      setSnackbar({ visible: true, message: 'Ingrese un ano valido' });
      return;
    }
    createMutation.mutate({ servicio_empresa_id: servicioId, mes: selectedMonth, anualidad: anio, amount_due: amount });
  };

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo Periodo' }} />
      <ScreenLayout scrollEnabled={false}>
        <ScrollView className="w-full flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <Card className="mb-6 p-5">
            <Text className="mb-4 text-lg font-bold text-slate-900">Nuevo Periodo</Text>

            <Text className="mb-2 text-sm font-medium text-slate-600">Mes</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              {months.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setSelectedMonth(m.value)}
                  className={`rounded-full px-4 py-2 ${selectedMonth === m.value ? 'bg-[#4DB6AC]' : 'bg-slate-100'}`}>
                  <Text
                    className={`text-sm font-medium ${selectedMonth === m.value ? 'text-white' : 'text-slate-700'}`}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-4">
              <TextInput
                label="Ano"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                mode="outlined"
                className="bg-white"
                placeholder="2026"
              />
            </View>

            <Controller
              control={control}
              name="monto"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Monto ($)"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  className="mb-4 bg-white"
                  placeholder="0.00"
                  error={!!errors.monto}
                />
              )}
            />
            {errors.monto && <Text className="-mt-3 mb-3 text-sm text-red-500">{errors.monto.message}</Text>}

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => router.back()} className="flex-1 rounded-2xl bg-slate-200 py-3">
                <Text className="text-center text-base font-semibold text-slate-600">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={createMutation.isPending}
                className="flex-1 rounded-2xl bg-[#4DB6AC] py-3 disabled:opacity-50">
                <Text className="text-center text-base font-semibold text-white">
                  {createMutation.isPending ? 'Creando...' : 'Crear Periodo'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </ScreenLayout>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}>
        {snackbar.message}
      </Snackbar>
    </>
  );
}
