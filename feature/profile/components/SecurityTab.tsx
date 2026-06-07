import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { impactLight, selection } from '@/helpers/haptics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/store/auth';
import { ControlledInput } from '@/components/ControlledInput';
import { SecurityFormData, securitySchema } from '@/schemas/securitySchema';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/services/auth.service';
import * as SecureStore from 'expo-secure-store';
import { Format } from '@/helpers/Formats';

const LINKED_CREDENTIALS_KEY = 'linked_credentials';

export const SecurityTab = () => {
  const id = useAuthStore((state) => state.user?.id);
  const colorScheme = useColorScheme();

  // Feedback
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  // Visibilidad de passwords
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // --- MUTACIÓN ---
  const mutation = useMutation({
    mutationFn: (data: SecurityFormData) => {
      if (!id) throw new Error('Usuario no identificado');
      return changePassword(id, data);
    },
    onSuccess: async (_, variables) => {
      // 1. Sincronizamos la nueva clave en local para que no falle la huella
      try {
        const stored = await SecureStore.getItemAsync(LINKED_CREDENTIALS_KEY);
        if (stored) {
          const creds = JSON.parse(stored);
          creds.password = variables.newPassword; // Actualizamos a la nueva
          await SecureStore.setItemAsync(LINKED_CREDENTIALS_KEY, JSON.stringify(creds));
        }
      } catch (e) {
        console.error('Error actualizando SecureStore:', e);
      }

      setSnackbar({ visible: true, message: '¡Contraseña actualizada con éxito!' });
      reset(); // Limpia los campos
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al actualizar contraseña';
      setSnackbar({ visible: true, message: msg });
    },
  });

  const onSubmit = (data: SecurityFormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Text className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Seguridad</Text>

      {/* TARJETA 1: Formulario */}
      <View className="mb-4">
        <View className="mb-4 flex-row items-center gap-2">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Cambiar Contraseña</Text>
        </View>
        <Text className="mb-5 text-sm text-slate-500 dark:text-slate-400">Actualiza tu contraseña para mantener tu cuenta segura</Text>

        <ControlledInput
          name="currentPassword"
          label="Contraseña Actual"
          control={control}
          error={errors.currentPassword?.message}
          onChangeText={(t) => Format.password(t)}
          secureTextEntry={!showCurrent}
          right={
            <TextInput.Icon
              icon={showCurrent ? 'eye-off' : 'eye'}
              onPress={() => {
                selection();
                setShowCurrent(!showCurrent);
              }}
            />
          }
          theme={colorScheme === 'dark' ? { colors: { background: '#121212', text: 'white', placeholder: 'gray' } } : undefined}
          textColor={colorScheme === 'dark' ? 'white' : undefined}
        />

        <ControlledInput
          name="newPassword"
          label="Nueva Contraseña"
          control={control}
          error={errors.newPassword?.message}
          onChangeText={(t) => Format.password(t)}
          secureTextEntry={!showNew}
          right={
            <TextInput.Icon
              icon={showNew ? 'eye-off' : 'eye'}
              onPress={() => {
                selection();
                setShowNew(!showNew);
              }}
            />
          }
          theme={colorScheme === 'dark' ? { colors: { background: '#121212', text: 'white', placeholder: 'gray' } } : undefined}
          textColor={colorScheme === 'dark' ? 'white' : undefined}
        />

        <ControlledInput
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          control={control}
          error={errors.confirmPassword?.message}
          onChangeText={(t) => Format.password(t)}
          secureTextEntry={!showConfirm}
          right={
            <TextInput.Icon
              icon={showConfirm ? 'eye-off' : 'eye'}
              onPress={() => {
                selection();
                setShowConfirm(!showConfirm);
              }}
            />
          }
          theme={colorScheme === 'dark' ? { colors: { background: '#121212', text: 'white', placeholder: 'gray' } } : undefined}
          textColor="white"
        />

        <TouchableOpacity
          onPress={() => {
            impactLight();
            handleSubmit(onSubmit)();
          }}
          disabled={mutation.isPending}
          className={`mt-2 h-12 items-center justify-center rounded-full ${
            mutation.isPending ? 'bg-slate-700' : 'bg-[#4DB6AC]'
          }`}>
          {mutation.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-base font-bold text-white">Actualizar Contraseña</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* TARJETA 2: Recomendaciones */}
      <View className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
        <Text className="mb-3 text-base font-bold text-red-700 dark:text-red-400">Recomendaciones de seguridad:</Text>
        <View className="pl-2">
          <RecommendationItem text="Usa al menos 8 caracteres" />
          <RecommendationItem text="Incluye mayúsculas, minúsculas y números" />
          <RecommendationItem text="No uses información personal" />
          <RecommendationItem text="Cambia tu contraseña regularmente" />
        </View>
      </View>

      {/* Feedback flotante */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        action={{ label: 'Cerrar', onPress: () => setSnackbar({ ...snackbar, visible: false }) }}
        duration={4000}>
        {snackbar.message}
      </Snackbar>
    </>
  );
};

const RecommendationItem = ({ text }: { text: string }) => (
  <View className="mb-2 flex-row items-center gap-2">
    <Text className="font-bold text-red-500 dark:text-red-400">•</Text>
    <Text className="flex-1 text-sm text-slate-600 dark:text-gray-300">{text}</Text>
  </View>
);
