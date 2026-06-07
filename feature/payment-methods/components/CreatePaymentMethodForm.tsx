import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePaymentMethodDTO } from '@/types/paymentMethod';
import { PaymentMethodFormData, paymentMethodSchema } from '@/schemas/paymentMethodSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import paymentMethodService from '@/services/paymentMethod.service';
import { Picker } from '@react-native-picker/picker';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

const tipos = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Digital', value: 'digital' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Otro', value: 'otro' },
];

export const CreatePaymentMethodForm = ({ onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema) as Resolver<PaymentMethodFormData>,
    defaultValues: {
      nombre: '',
      descripcion: '',
      tipo: '',
      activo: true,
      comision: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentMethodDTO) => paymentMethodService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data: PaymentMethodFormData) => {
    createMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header fijo */}
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Crear Método de Pago</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)}>
          <Text className="font-bold text-[#4DB6AC]">Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {/* SECCIÓN: Información */}
        <View className="mb-6">
          <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">Información</Text>
          <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
            <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} />
            <ControlledInput
              name="descripcion"
              label="Descripción"
              control={control}
              error={errors.descripcion?.message}
              multiline
            />
            <View className="mb-4">
              <Text className="mb-1 text-sm font-medium text-slate-700">Tipo</Text>
              <Controller
                control={control}
                name="tipo"
                render={({ field: { onChange, value } }) => (
                  <View className="rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-primary-dark">
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
            <ControlledInput
              name="comision"
              label="Comisión"
              control={control}
              error={errors.comision?.message}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};
