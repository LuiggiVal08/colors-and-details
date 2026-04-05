import { Redirect, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAuthStore, User } from '../../store/auth';
import {
  TextInput,
  Button,
  HelperText,
  Snackbar,
  ActivityIndicator,
  Modal,
  Portal,
} from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import Logo from '@/components/Logo';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { loginSchema } from '@/schemas/loginSchema';
import { useEffect, useState } from 'react';
import HelpButton from '@/components/HelpButton';
import { Format } from '@/helpers/Formats';
import { type LoginCredentials, signIn } from '@/services/auth.service';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { maskUsername } from '@/helpers/maskUsername';

const LINKED_CREDENTIALS_KEY = 'linked_credentials';
const LINKED_USERNAME_KEY = 'linked_username';

// --- Componente Principal ---
export default function LoginScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const login = useAuthStore((state) => state.login);

  const [linkedUsername, setLinkedUsername] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showError = (message: string) => setSnackbar({ visible: true, message });

  const mutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: (variables: LoginCredentials) => signIn(variables),
    onSuccess: async (data, variables) => {
      login(data);
      if (variables?.username && variables?.password) {
        await SecureStore.setItemAsync(LINKED_CREDENTIALS_KEY, JSON.stringify(variables));
        await AsyncStorage.setItem(LINKED_USERNAME_KEY, variables.username);
        setLinkedUsername(variables.username);
      }
      setIsModalVisible(false);
      router.replace('/shopping');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error de conexión';
      showError(message);
    },
  });

  useEffect(() => {
    (async () => {
      const username = await AsyncStorage.getItem(LINKED_USERNAME_KEY);
      if (username) setLinkedUsername(username);
      setIsLoadingStorage(false);
    })();
  }, []);

  const handleUnlink = async () => {
    await SecureStore.deleteItemAsync(LINKED_CREDENTIALS_KEY);
    await AsyncStorage.removeItem(LINKED_USERNAME_KEY);
    setLinkedUsername(null);
    showError('Dispositivo desvinculado');
  };

  if (!hasHydrated || isLoadingStorage) return <ActivityIndicator size="large" color="#4DB6AC" />;
  if (user) return <Redirect href="/shopping" />;

  return (
    <ScreenLayout centerContent={true}>
      <View className="w-full max-w-md items-center justify-center rounded-3xl border border-slate-700 bg-white p-8 px-6 py-8 shadow-xl">
        <View className="items-center justify-center pb-6">
          <Logo />
          {/* <Text className="text-xl font-bold text-slate-800">Bienvenido a Colores y Detalles</Text> */}
        </View>

        {linkedUsername ? (
          <BiometricLoginView
            username={linkedUsername}
            onBiometricPress={async () => {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acceder con autenticación biométrica',
                promptDescription:
                  'Ingrese su huella dactilar o coloque su rostro frente al dispositivo para iniciar sesión',
              });
              if (result.success) {
                const stored = await SecureStore.getItemAsync(LINKED_CREDENTIALS_KEY);
                if (stored) mutation.mutate(JSON.parse(stored));
              }
            }}
            onPasswordPress={() => setIsModalVisible(true)}
            onUnlink={handleUnlink}
          />
        ) : (
          <LoginForm onSubmit={(creds) => mutation.mutate(creds)} isLoading={mutation.isPending} />
        )}
      </View>

      <LinkedPasswordModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        username={linkedUsername || ''}
        onSubmit={(password) => mutation.mutate({ username: linkedUsername!, password })}
        isLoading={mutation.isPending}
      />

      <HelpButton />
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        style={{ backgroundColor: '#B00020' }}>
        {snackbar.message}
      </Snackbar>
    </ScreenLayout>
  );
}

// --- Sub-componente: Vista Biométrica ---
const BiometricLoginView = ({ username, onBiometricPress, onPasswordPress, onUnlink }: any) => (
  <View className=" items-center justify-center">
    <View className=" my-8 items-center justify-center ">
      <Text className="text-base text-slate-600">Iniciar sesión como </Text>
      <Text className="text-3xl font-semibold text-slate-800">{maskUsername(username)}</Text>
      <TouchableOpacity
        className="my-4 h-16 w-16 items-center justify-center rounded-full bg-[#4DB6AC] shadow-lg"
        onPress={onBiometricPress}>
        <Ionicons name="finger-print" size={40} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPasswordPress}>
        <Text className="text-base font-bold text-[#4DB6AC] underline">
          Ingresa con tu contraseña
        </Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity
      onPress={onUnlink}
      className="mt-4 flex flex-row items-center gap-2 rounded-lg bg-slate-100 p-2">
      <Ionicons name="log-out-outline" size={20} color="#4DB6AC" />
      <Text className="text-base text-slate-400 ">Desvincular dispositivo</Text>
    </TouchableOpacity>
  </View>
);

interface LinkedPasswordFormProps {
  username: string;
  onSubmit: (password: string) => void;
  isLoading: boolean;
  onDismiss: () => void;
  visible: boolean;
}
// --- Sub-componente: Modal de Password ---
const LinkedPasswordModal = ({
  visible,
  onDismiss,
  username,
  onSubmit,
  isLoading,
}: LinkedPasswordFormProps) => {
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 25,
          margin: 20,
          borderRadius: 20,
        }}>
        <Text className="mb-4 text-lg font-bold text-slate-800">Confirmar Contraseña</Text>
        <Text className="mb-4 text-sm text-slate-500">
          Ingresa la clave para {maskUsername(username)}
        </Text>

        <TextInput
          label="Contraseña"
          mode="outlined"
          secureTextEntry={secure}
          value={password}
          onChangeText={setPassword}
          theme={{ colors: { primary: '#4DB6AC' } }}
          right={
            <TextInput.Icon icon={secure ? 'eye' : 'eye-off'} onPress={() => setSecure(!secure)} />
          }
        />

        <Button
          mode="contained"
          onPress={() => onSubmit(password)}
          loading={isLoading}
          disabled={isLoading}
          className="mt-6 py-1">
          <Text>Iniciar Sesión</Text>
        </Button>
        <Button mode="text" onPress={onDismiss} className="mt-2">
          <Text>Cancelar</Text>
        </Button>
      </Modal>
    </Portal>
  );
};

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading: boolean;
}

// --- Sub-componente: Formulario Normal ---
const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  const [secureEntry, setSecureEntry] = useState(true);
  const router = useRouter();
  return (
    <View className="mt-4 w-full">
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-2">
            <TextInput
              label="Usuario"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={(t) => onChange(Format.username(t))}
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
          <View>
            <TextInput
              label="Contraseña"
              mode="outlined"
              secureTextEntry={secureEntry}
              onBlur={onBlur}
              onChangeText={(t) => onChange(Format.password(t))}
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
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        className="mt-4">
        <Text>Iniciar Sesión</Text>
      </Button>
      <TouchableOpacity onPress={() => router.push('/rescue')} className="mx-auto mt-6">
        <Text className="text-sm text-slate-400 underline">¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
};
