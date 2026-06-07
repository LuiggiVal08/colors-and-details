import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Client, UpdateClientDTO } from '@/types/client';
import { ClientFormData, clientSchema } from '@/schemas/clientSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { ControlledInput } from '@/components/ControlledInput';
import clientService from '@/services/client.service';
import { Switch } from 'react-native-paper';

interface Props {
  initialData: Client;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditClientForm = ({ initialData, onClose, onSuccess }: Props) => {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: initialData.nombre,
      apellido: initialData.apellido,
      cedula: initialData.cedula,
      telefono: initialData.telefono,
      email: initialData.email,
      direccion: initialData.direccion,
      activo: initialData.activo,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientDTO) => clientService.update(initialData.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', initialData.id] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data: ClientFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header fijo */}
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cancelar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Editar Cliente</Text>
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
            <Controller
              control={control}
              name="activo"
              render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} />}
            />
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
