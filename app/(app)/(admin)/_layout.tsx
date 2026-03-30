import { Slot, Redirect } from 'expo-router';
import { useAuthStore } from '../../../store/auth';

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return <Redirect href="/shopping" />;
  }

  return <Slot screenOptions={{ headerShown: false }} />;
}
