import { Text, View } from 'react-native';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { useAuthStore } from '../../store/auth';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScreenLayout>
      <View className="w-full max-w-2xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">Mi Perfil</Text>
        <Text className="mb-3 text-base text-slate-600">Nombre: {user?.name ?? 'Invitado'}</Text>
        <Text className="text-base text-slate-600">Rol: {user?.role ?? 'Sin rol'}</Text>
      </View>
    </ScreenLayout>
  );
}
