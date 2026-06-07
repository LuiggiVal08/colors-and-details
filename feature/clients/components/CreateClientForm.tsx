import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateClientDTO } from '@/types/client';
import { ClientFormData, clientSchema } from '@/schemas/clientSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import clientService from '@/services/client.service';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateClientForm = ({ onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClientDTO) => clientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data: ClientFormData) => {
    createMutation.mutate({ ...data, activo: data.activo ?? true });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header fijo */}
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Crear Cliente</Text>
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
          />
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
