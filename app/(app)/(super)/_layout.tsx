import { Stack, Redirect } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/auth';
import { themeDark } from '@/constants/theme';

export default function SuperAdminLayout() {
  const user = useAuthStore((state) => state.user);
  const isSuper = user?.role === 'superadmin';
  const colorScheme = useColorScheme();

  if (!isSuper) {
    return <Redirect href="/shopping" />;
  }

  const headerBg = colorScheme === 'dark' ? themeDark.colors.surface : '#FFFFFF';
  const headerText = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'ios_from_right',
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerText,
        // statusBarTranslucent:false => header nativo con topInsetEnabled=false
        // (alto normal). Con true, edge-to-edge duplica el alto del header.
        statusBarTranslucent: false,
      }}
    />
  );
}
