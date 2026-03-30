import { Text, View } from 'react-native';
import { useAuthStore } from '../../store/auth';
import ScreenLayout from '../../components/layout/ScreenLayout';

export default function HelpScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScreenLayout>
      <View className="w-full max-w-2xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Ayuda</Text>
        <Text className="mb-4 text-base leading-7 text-slate-600">
          {user
            ? `Hola, ${user.name}. Esta es la página de ayuda para usuarios con sesión.`
            : 'Esta sección es accesible sin sesión. Aquí puedes ver contenido general de ayuda.'}
        </Text>
        <Text className="text-sm text-slate-500">
          Si necesitas soporte, contacta con el equipo o regresa a la pantalla de login.
        </Text>
      </View>
    </ScreenLayout>
  );
}
