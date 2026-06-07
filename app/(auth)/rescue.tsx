import { Text, View } from 'react-native';
import ScreenLayout from '../../components/layout/ScreenLayout';

export default function RescueScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-2xl rounded-3xl bg-white/90 p-8 shadow-lg dark:bg-primary-dark/90">
        <Text className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Rescue</Text>
        <Text className="mb-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          Esta es la pantalla de rescate. Coloca aquí tus procesos de recuperación de cuenta,
          soporte o instrucciones de emergencia.
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          Disponible para cualquiera sin iniciar sesión.
        </Text>
      </View>
    </ScreenLayout>
  );
}
