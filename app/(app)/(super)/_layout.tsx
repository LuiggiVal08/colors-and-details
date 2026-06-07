import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function SuperAdminLayout() {
  const user = useAuthStore((state) => state.user);
  const isSuper = user?.role === 'superadmin';

  if (!isSuper) {
    return <Redirect href="/shopping" />;
  }

  return <Stack screenOptions={{ headerShown: true, animation: 'ios_from_right' }} />;
}
