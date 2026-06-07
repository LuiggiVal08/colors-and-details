import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import employeeService from '@/services/employee.service';
import type { Employee } from '@/types/employee';
import { EmployeeFormData, employeeSchema } from '@/schemas/employeeSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';

interface Props {
  initialData: Employee;
  onClose: () => void;
}

export const EmployeeForm = ({ initialData, onClose }: Props) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    // <--- Usamos el tipo inferido de Zod
    resolver: zodResolver(employeeSchema),
    // Forzamos el tipado de los valores iniciales para que coincidan exactamente
    defaultValues: initialData as EmployeeFormData,
  });

  const mutation = useMutation({
    mutationFn: (data: EmployeeFormData) =>
      employeeService.update(initialData.id.toString(), { ...initialData, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', initialData.id] });
      onClose();
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header fijo */}
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Perfil de Empleado</Text>
        <TouchableOpacity onPress={handleSubmit((d) => mutation.mutate(d))}>
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
          />
        </FormSection>

        {/* SECCIÓN: Contacto */}
        <FormSection title="Contacto y Ubicación">
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

        {/* SECCIÓN: Laboral (Solo lectura o ajustes) */}
        <FormSection title="Datos Laborales">
          {/* Ejemplo de campo informativo no editable en el form */}
          <View className="mt-2 rounded-lg bg-slate-100 p-4">
            <Text className="text-xs text-slate-500">Salario Base</Text>
            <Text className="text-slate-800">${Number(initialData.salario_base).toLocaleString()}</Text>
          </View>
          <View className="mt-2 rounded-lg bg-slate-100 p-4">
            <Text className="text-xs text-slate-500">Fecha de Ingreso</Text>
            <Text className="text-slate-800">{initialData.fecha_ingreso}</Text>
          </View>

          <View className="mt-2 rounded-lg bg-slate-100 p-4">
            <Text className="text-xs text-slate-500">Estado</Text>
            <Text className={initialData.activo ? 'text-green-600' : 'text-red-600'}>
              {initialData.activo ? 'Activo' : 'Inactivo'}
            </Text>
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
