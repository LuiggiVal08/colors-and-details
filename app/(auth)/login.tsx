import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAuthStore } from '../../store/auth';
import { TextInput, Button, HelperText } from 'react-native-paper';

import Logo from '@/components/Logo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { loginSchema } from '@/schemas/loginSchema';
import { useState } from 'react';
import HelpButton from '@/components/HelpButton';
import { Format } from '@/helpers/Formats';

const roles = [
  { label: 'Usuario', role: 'user' as const },
  { label: 'Admin', role: 'admin' as const },
  { label: 'Superadmin', role: 'superadmin' as const },
];

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = (role: 'user' | 'admin' | 'superadmin') => {
    login({ name: role === 'superadmin' ? 'Súper' : role === 'admin' ? 'Admin' : 'Cliente', role });
    router.replace('/shopping');
  };

  return (
    <ScreenLayout>
      <View className="w-full max-w-md items-center justify-center rounded-3xl border border-slate-300 bg-white/90 p-8 shadow-lg">
        <Text className="text-lg text-gray-700">Iniciar sesión como:</Text>
        <View className="mt-4 flex-row justify-between">
          {roles.map(({ label, role }) => (
            <TouchableOpacity
              key={role}
              onPress={() => handleLogin(role)}
              className={classStyles.button}>
              <Text className="text-xl text-gray-700">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View className=" w-full max-w-md items-center justify-center rounded-3xl border border-slate-300 bg-white p-8 shadow-lg">
        <View className="flex items-center justify-center">
          <Logo />
          <Text className="text-xl text-gray-700">Bienvenido a Colores y Detalles</Text>
          <Text className="text-lg text-gray-700">
            Ingresa tus credenciales para Iniciar sesión
          </Text>
        </View>
        <LoginForm />

        <View className="my-4 flex flex-row items-center justify-center">
          <TouchableOpacity onPress={() => router.push('/rescue')}>
            <Text className="text-xl text-blue-700">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <HelpButton />
    </ScreenLayout>
  );
}

const LoginForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  const [secureEntery, setSecureEntery] = useState(true);
  const onSubmit = (data: { username: string; password: string }) => {
    console.log(data);
  };

  return (
    <View className="mt-4 w-full max-w-md">
      <View className=" space-y-4">
        {/* Campo de Usuario */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className=" w-full">
              <TextInput
                theme={{
                  colors: {
                    primary: '#4DB6AC', // Color del borde cuando está enfocado
                    // error: '#E57373', // Color del borde cuando hay error
                  },
                }}
                label="Nombre de usuario"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={(text) => onChange(Format.username(text))}
                value={value}
                error={!!errors.username} // Se pone rojo si hay error
                left={<TextInput.Icon icon="account" />}
              />
              <HelperText type="error" visible={!!errors.username}>
                {errors.username?.message}
              </HelperText>
            </View>
          )}
        />
        {/* Campo de Contraseña */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mt-2 w-full">
              <TextInput
                className="w-full"
                theme={{
                  colors: {
                    primary: '#4DB6AC', // Color del borde cuando está enfocado
                    // error: '#E57373', // Color del borde cuando hay error
                  },
                }}
                label="Contraseña"
                mode="outlined"
                // 1. Usamos el estado aquí
                secureTextEntry={secureEntery}
                onBlur={onBlur}
                onChangeText={(text) => onChange(Format.password(text))}
                value={value}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                // 2. Añadimos el "ojito" a la derecha
                right={
                  <TextInput.Icon
                    icon={secureEntery ? 'eye' : 'eye-off'}
                    onPress={() => setSecureEntery(!secureEntery)}
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

      {/* Botón de Envío */}
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        className="mt-6 py-1">
        Iniciar Sesión
      </Button>
    </View>
  );
};

const classStyles = {
  button:
    'flex-row items-center justify-between rounded-lg border border-slate-300 bg-white/90 p-4 shadow-lg',
};
