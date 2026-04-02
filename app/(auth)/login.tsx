import { Redirect, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAuthStore, User } from '../../store/auth';
import { TextInput, Button, HelperText, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import Logo from '@/components/Logo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { loginSchema } from '@/schemas/loginSchema';
import { useState } from 'react';
import HelpButton from '@/components/HelpButton';
import { Format } from '@/helpers/Formats';
import { type LoginCredentials, signIn } from '@/services/auth.service';

// const roles = [
//   { label: 'Usuario', role: 'user' as const },
//   { label: 'Admin', role: 'admin' as const },
//   { label: 'Superadmin', role: 'superadmin' as const },
// ];

export default function LoginScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // 1. Mueve el hook de estado AQUÍ arriba
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  // 2. Definición de funciones (también antes de los retornos)
  const onDismissSnackbar = () => setSnackbar({ ...snackbar, visible: false });
  const showError = (message: string) => setSnackbar({ visible: true, message });

  // 3. Ahora sí, los retornos condicionales
  if (!hasHydrated) {
    return <ActivityIndicator size="large" color="#4DB6AC" />;
  }

  if (user) {
    return <Redirect href="/shopping" />;
  }

  // 4. El renderizado principal
  return (
    <ScreenLayout>
      <View className="w-full max-w-md items-center justify-center rounded-3xl border border-slate-300 bg-white p-8 shadow-lg">
        <View className="flex items-center justify-center">
          <Logo />
          <Text className="text-xl text-gray-700">Bienvenido a Colores y Detalles</Text>
          <Text className="text-lg text-gray-700">
            Ingresa tus credenciales para Iniciar sesión
          </Text>
        </View>

        <LoginForm onAuthError={showError} />

        <View className="my-4 flex flex-row items-center justify-center">
          <TouchableOpacity onPress={() => router.push('/rescue')}>
            <Text className="text-xl text-blue-700">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <HelpButton />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={onDismissSnackbar}
        duration={4000}
        action={{ label: 'OK', onPress: onDismissSnackbar }}
        style={{ backgroundColor: '#B00020' }}>
        {snackbar.message}
      </Snackbar>
    </ScreenLayout>
  );
}

// Definimos la interfaz para las props
interface LoginFormProps {
  onAuthError: (message: string) => void;
}

const LoginForm = ({ onAuthError }: LoginFormProps) => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const [secureEntry, setSecureEntry] = useState(true);

  const mutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: (variables: LoginCredentials) => signIn(variables),
    onSuccess: (data) => {
      login(data);
      router.replace('/shopping');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error de conexión con el servidor';
      // Llamamos a la función que recibimos por props
      onAuthError(message);
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    mutation.mutate(data);
  };

  return (
    <View className="mt-4 w-full max-w-md">
      <View className="space-y-4">
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="w-full">
              <TextInput
                theme={{ colors: { primary: '#4DB6AC' } }}
                label="Nombre de usuario"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={(text) => onChange(Format.username(text))}
                value={value}
                error={!!errors.username}
                left={<TextInput.Icon icon="account" />}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username?.message}
              </HelperText>
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mt-2 w-full">
              <TextInput
                theme={{ colors: { primary: '#4DB6AC' } }}
                label="Contraseña"
                mode="outlined"
                secureTextEntry={secureEntry}
                onBlur={onBlur}
                onChangeText={(text) => onChange(Format.password(text))}
                value={value}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={secureEntry ? 'eye' : 'eye-off'}
                    onPress={() => setSecureEntry(!secureEntry)}
                  />
                }
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password?.message}
              </HelperText>
            </View>
          )}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
        disabled={mutation.isPending}
        className="mt-6 py-1">
        Iniciar Sesión
      </Button>
    </View>
  );
};
