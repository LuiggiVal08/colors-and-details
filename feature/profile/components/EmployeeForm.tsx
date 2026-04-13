import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee, updateEmployee } from '@/services/employee.service';
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
      updateEmployee(initialData.id, { ...initialData, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', initialData.id] });
      onClose();
    },
  });

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header fijo */}
      <View className="flex-row items-center justify-between border-b border-gray-200 bg-white p-5 pt-12">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-blue-600">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Perfil de Empleado</Text>
        <TouchableOpacity onPress={handleSubmit((d) => mutation.mutate(d))}>
          <Text className="font-bold text-blue-600">Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        {/* SECCIÓN: Información Personal */}
        <FormSection title="Información Personal">
          <ControlledInput
            name="nombre"
            label="Nombre"
            control={control}
            error={errors.nombre?.message}
          />
          <ControlledInput
            name="apellido"
            label="Apellido"
            control={control}
            error={errors.apellido?.message}
          />
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
          <View className="mt-2 rounded-lg bg-gray-100 p-4">
            <Text className="text-xs text-gray-500">Salario Base</Text>
            <Text className="text-gray-800">
              ${Number(initialData.salario_base).toLocaleString()}
            </Text>
          </View>
          <View className="mt-2 rounded-lg bg-gray-100 p-4">
            <Text className="text-xs text-gray-500">Fecha de Ingreso</Text>
            <Text className="text-gray-800">{initialData.fecha_ingreso}</Text>
          </View>

          <View className="mt-2 rounded-lg bg-gray-100 p-4">
            <Text className="text-xs text-gray-500">Estado</Text>
            <Text className={initialData.activo ? 'text-green-600' : 'text-red-600'}>
              {initialData.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </FormSection>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

// Componentes de apoyo para mantener el orden
const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="mb-2 ml-1 text-xs font-bold uppercase text-gray-400">{title}</Text>
    <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">{children}</View>
  </View>
);
