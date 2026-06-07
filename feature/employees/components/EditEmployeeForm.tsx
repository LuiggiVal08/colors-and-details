import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee, UpdateEmployeeDTO } from '@/types/employee';
import { EmployeeFormData, employeeSchema } from '@/schemas/employeeSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import employeeService from '@/services/employee.service';
import { SegmentedButtons, Switch } from 'react-native-paper';

interface Props {
  initialData: Employee;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditEmployeeForm = ({ initialData, onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nombre: initialData.nombre,
      apellido: initialData.apellido,
      cedula: initialData.cedula,
      telefono: initialData.telefono,
      email: initialData.email,
      direccion: initialData.direccion,
      salario_base: initialData.salario_base,
      frecuencia_pago: initialData.frecuencia_pago,
      activo: initialData.activo,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEmployeeDTO) => employeeService.update(initialData.id.toString(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', initialData.id] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header fijo */}
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Editar Empleado</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)}>
          <Text className="font-bold text-[#4DB6AC]">Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {/* SECCIÓN: Información Personal */}
        <FormSection title="Información Personal">
          <ControlledInput name="nombre" label="Nombre" control={control} error={errors.nombre?.message} />
          <ControlledInput name="apellido" label="Apellido" control={control} error={errors.apellido?.message} />
          <ControlledInput
            name="cedula"
            label="Cédula"
            control={control}
            error={errors.cedula?.message}
            keyboardType="numeric"
            editable={false}
          />
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-base text-slate-700">Estado</Text>
            <Switch value={control._formValues.activo} onValueChange={(value) => setValue('activo', value)} />
          </View>
        </FormSection>

        {/* SECCIÓN: Contacto */}
        <FormSection title="Contacto">
          <ControlledInput
            name="email"
            label="Correo Electrónico"
            control={control}
            error={errors.email?.message}
            keyboardType="email-address"
          />
          <ControlledInput
            name="telefono"
            label="Teléfono"
            control={control}
            error={errors.telefono?.message}
            keyboardType="phone-pad"
          />
          <ControlledInput
            name="direccion"
            label="Dirección"
            control={control}
            error={errors.direccion?.message}
            multiline
          />
        </FormSection>

        {/* SECCIÓN: Información Laboral */}
        <FormSection title="Información Laboral">
          <ControlledInput
            name="salario_base"
            label="Salario Base"
            control={control}
            error={errors.salario_base?.message}
            keyboardType="numeric"
          />
          <View className="mb-2">
            <Text className="mb-2 text-sm font-medium text-slate-700">Frecuencia de Pago</Text>
            <Controller
              control={control}
              name="frecuencia_pago"
              render={({ field: { onChange, value } }) => (
                <SegmentedButtons
                  value={value || ''}
                  onValueChange={onChange}
                  buttons={[
                    { value: 'mensual', label: 'Mensual' },
                    { value: 'quincenal', label: 'Quincenal' },
                    { value: 'semanal', label: 'Semanal' },
                  ]}
                />
              )}
            />
            {errors.frecuencia_pago?.message && (
              <Text className="ml-1 mt-1 text-xs font-medium text-red-500">
                {errors.frecuencia_pago.message}
              </Text>
            )}
          </View>
        </FormSection>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

// Componentes de apoyo para mantener el orden
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="mb-2 ml-1 text-xs font-bold uppercase text-slate-400">{title}</Text>
    <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">{children}</View>
  </View>
);
