import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import servicePeriodService from '@/services/servicePeriod.service';
import servicePaymentService from '@/services/servicePayment.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import { ControlledInput } from '@/components/ControlledInput';
import { Ionicons } from '@expo/vector-icons';
import { Snackbar, TextInput } from 'react-native-paper';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const paymentSchema = z.object({
  monto: z.string().min(1, 'Ingrese un monto'),
  descripcion: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function ServicePaymentCreate() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const servicioId = Number(id);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { monto: '', descripcion: '' },
  });

  const { data: periodsRaw, isLoading: loadingPeriods } = useQuery({
    queryKey: ['service-periods', servicioId],
    queryFn: () => servicePeriodService.getByService(servicioId),
    enabled: !isNaN(servicioId),
  });
  const periods = Array.isArray(periodsRaw) ? periodsRaw : [];

  const createMutation = useMutation({
    mutationFn: (data: { service_period_id: number; amount: number; descripcion?: string }) =>
      servicePaymentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-periods'] });
      setSnackbar({ visible: true, message: 'Pago registrado correctamente' });
      setTimeout(() => router.back(), 1200);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Error al registrar pago';
      setSnackbar({ visible: true, message: `${msg} (${axiosErr?.response?.status || 'sin status'})` });
    },
  });

  const onSubmit = (form: PaymentForm) => {
    if (!selectedPeriodId) {
      setSnackbar({ visible: true, message: 'Seleccione un período' });
      return;
    }
    const amount = parseFloat(form.monto);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({ visible: true, message: 'Ingrese un monto válido' });
      return;
    }

    const period = periods.find((p) => p.id === selectedPeriodId);
    if (period && period.amount_balance && amount > Number(period.amount_balance)) {
      Alert.alert(
        'Monto excede el balance',
        `El monto ($${amount.toFixed(2)}) excede el balance restante ($${Number(period.amount_balance).toFixed(2)}). Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () =>
              createMutation.mutate({
                service_period_id: selectedPeriodId,
                amount,
                descripcion: form.descripcion || undefined,
              }),
          },
        ]
      );
      return;
    }

    createMutation.mutate({
      service_period_id: selectedPeriodId,
      amount,
      descripcion: form.descripcion || undefined,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Registrar Pago' }} />
      <ScreenLayout scrollEnabled={false}>
        <ScrollView className="w-full flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <Card className="mb-6 p-5">
            <Text className="mb-4 text-lg font-bold text-slate-900">Seleccionar Periodo</Text>
            {loadingPeriods ? (
              <Text className="text-sm text-slate-400">Cargando periodos...</Text>
            ) : periods.length === 0 ? (
              <Text className="text-sm text-slate-400">No hay periodos disponibles</Text>
            ) : (
              periods.map((period) => {
                const isSelected = selectedPeriodId === period.id;
                return (
                  <TouchableOpacity
                    key={period.id}
                    onPress={() => setSelectedPeriodId(period.id)}
                    className={`mb-2 rounded-lg border p-3 ${
                      isSelected ? 'border-[#4DB6AC] bg-teal-50' : 'border-slate-200'
                    }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-semibold text-slate-900">
                            {MONTH_NAMES[period.mes - 1]} {period.anualidad}
                          </Text>
                          {isSelected && <Ionicons name="checkmark-circle" size={18} color="#4DB6AC" />}
                        </View>
                        <Text className="text-sm text-slate-500">
                          Monto: ${Number(period.amount_due).toFixed(2)}
                          {period.amount_balance ? ` - Balance: $${Number(period.amount_balance).toFixed(2)}` : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          <Card className="mb-6 p-5">
            <Text className="mb-4 text-lg font-bold text-slate-900">Datos del Pago</Text>
            <ControlledInput
              control={control}
              name="monto"
              label="Monto"
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={errors.monto?.message}
            />
            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, value } }) => (
                <View className="mt-3">
                  <TextInput
                    label="Descripcion (opcional)"
                    value={value || ''}
                    onChangeText={onChange}
                    mode="outlined"
                    className="bg-white"
                    placeholder="Ej: Pago de marzo"
                  />
                </View>
              )}
            />
          </Card>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#4DB6AC] py-4 disabled:opacity-50">
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-base font-semibold text-white">
              {createMutation.isPending ? 'Registrando...' : 'Confirmar Pago'}
            </Text>
          </TouchableOpacity>
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
