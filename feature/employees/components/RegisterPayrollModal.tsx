import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ControlledInput } from '@/components/ControlledInput';
import employeePayrollService from '@/services/employeePayroll.service';
import { useExchangeRateStore } from '@/store/exchangeRate';
import type { EmployeeDebt } from '@/types/employeeDebt';

const payrollSchema = z.object({
  fecha_inicio: z.string().min(1, 'Requerido').regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  fecha_fin: z.string().min(1, 'Requerido').regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
  monto: z.string().min(1, 'Requerido'),
  bono: z.string().optional(),
  deduccion: z.string().optional(),
  monto_usd: z.string().optional(),
  descripcion: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface Props {
  empleadoId: number;
  onClose: () => void;
  debt?: EmployeeDebt | null;
}

export const RegisterPayrollModal = ({ empleadoId, onClose, debt }: Props) => {
  const queryClient = useQueryClient();
  const tasa = useExchangeRateStore((s) => s.tasa);
  const loadTasa = useExchangeRateStore((s) => s.load);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      fecha_inicio: debt?.periodos.find((p) => !p.pagado)?.fecha_inicio || '',
      fecha_fin: debt?.periodos.find((p) => !p.pagado)?.fecha_fin || '',
      monto: '',
      bono: '0',
      deduccion: '0',
      monto_usd: '',
      descripcion: '',
    },
  });

  useEffect(() => {
    if (!tasa) loadTasa();
  }, [tasa, loadTasa]);

  const watchedMonto = watch('monto');
  const watchedBono = watch('bono');
  const watchedDeduccion = watch('deduccion');

  const montoNum = parseFloat((watchedMonto || '0').replace(',', '.'));
  const bonoNum = parseFloat((watchedBono || '0').replace(',', '.'));
  const deduccionNum = parseFloat((watchedDeduccion || '0').replace(',', '.'));
  const neto = montoNum + bonoNum - deduccionNum;

  const handleMontoChange = (_text: string) => {
    if (tasa && neto > 0) {
      setValue('monto_usd', (neto / tasa).toFixed(2));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: PayrollFormData) =>
      employeePayrollService.create({
        empleado_id: String(empleadoId),
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        monto: data.monto,
        bono: data.bono || '0',
        deduccion: data.deduccion || '0',
        monto_usd: data.monto_usd || String(neto > 0 && tasa ? (neto / tasa).toFixed(2) : '0'),
        descripcion: data.descripcion,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', String(empleadoId)] });
      queryClient.invalidateQueries({ queryKey: ['employeeDebt', String(empleadoId)] });
      onClose();
    },
  });

  const onSubmit = (data: PayrollFormData) => {
    createMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Registrar Pago</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
          <Text className="font-bold text-[#4DB6AC]">{createMutation.isPending ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Período</Text>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
            <ControlledInput
              name="fecha_inicio"
              label="Fecha Inicio (YYYY-MM-DD)"
              control={control}
              error={errors.fecha_inicio?.message}
              placeholder="2024-11-01"
            />
            <ControlledInput
              name="fecha_fin"
              label="Fecha Fin (YYYY-MM-DD)"
              control={control}
              error={errors.fecha_fin?.message}
              placeholder="2024-11-30"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Montos</Text>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
            <ControlledInput
              name="monto"
              label="Monto (Bs.)"
              control={control}
              error={errors.monto?.message}
              keyboardType="numeric"
              placeholder="0,00"
              onChangeText={handleMontoChange}
            />
            <ControlledInput
              name="bono"
              label="Bono (Bs.)"
              control={control}
              error={errors.bono?.message}
              keyboardType="numeric"
              placeholder="0,00"
            />
            <ControlledInput
              name="deduccion"
              label="Deducción (Bs.)"
              control={control}
              error={errors.deduccion?.message}
              keyboardType="numeric"
              placeholder="0,00"
            />
            {neto > 0 && (
              <View className="mb-4 rounded-lg bg-slate-50 p-3">
                <Text className="text-sm text-slate-500">Neto: Bs. {neto.toFixed(2)}</Text>
                {tasa && (
                  <Text className="text-sm text-slate-500">
                    ≈ USD {(neto / tasa).toFixed(2)} (tasa: {tasa})
                  </Text>
                )}
              </View>
            )}
            <ControlledInput
              name="monto_usd"
              label="Monto USD (opcional)"
              control={control}
              error={errors.monto_usd?.message}
              keyboardType="numeric"
              placeholder="Calculado automáticamente"
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Detalle</Text>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
            <ControlledInput
              name="descripcion"
              label="Descripción (opcional)"
              control={control}
              error={errors.descripcion?.message}
              multiline
            />
          </View>
        </View>

        <View className="h-20" />

        {createMutation.isError && (
          <View className="mb-4 rounded-lg bg-red-50 p-3">
            <Text className="text-sm text-red-600">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : 'Error al guardar el pago'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
