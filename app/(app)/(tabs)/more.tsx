import { Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { Avatar } from 'react-native-paper';
import { useAuthStore, type UserRole } from '@/store/auth';
import { serverLogout } from '@/services/auth.service';
import { disconnectSocket } from '@/services/socket';

type IconName =
  | 'cube-outline'
  | 'card-outline'
  | 'people-outline'
  | 'construct-outline'
  | 'person-outline'
  | 'help-circle-outline'
  | 'settings-outline'
  | 'bar-chart-outline'
  | 'cloud-upload-outline'
  | 'sync-outline'
  | 'archive-outline'
  | 'receipt-outline';

type Category = 'operations' | 'config' | 'system' | 'support';

interface Option {
  name: string;
  route: string;
  icon: IconName;
  category: Category;
}

const categoryMeta: Record<Category, { label: string; bg: string; iconColor: string }> = {
  operations: {
    label: 'Operaciones',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: '#3B82F6',
  },
  config: {
    label: 'Configuración',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: '#8B5CF6',
  },
  system: {
    label: 'Sistema',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: '#F97316',
  },
  support: {
    label: 'Soporte',
    bg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: '#22C55E',
  },
};

const options: Option[] = [
  { route: '/box-register', name: 'Caja', icon: 'archive-outline', category: 'operations' },
  { route: '/payments-methods/', name: 'Pagos', icon: 'card-outline', category: 'operations' },
  { route: '/inventory', name: 'Inventario', icon: 'cube-outline', category: 'operations' },
  { route: '/reports', name: 'Reportes', icon: 'bar-chart-outline', category: 'operations' },
  { route: '/service/', name: 'Servicios', icon: 'construct-outline', category: 'config' },
  { route: '/employees/', name: 'Empleados', icon: 'people-outline', category: 'config' },
  { route: '/payroll', name: 'Nómina', icon: 'receipt-outline', category: 'config' },
  { route: '/settings', name: 'Ajustes', icon: 'settings-outline', category: 'config' },
  { route: '/backup', name: 'Respaldo', icon: 'cloud-upload-outline', category: 'system' },
  { route: '/help', name: 'Ayuda', icon: 'help-circle-outline', category: 'system' },
];

const groupedOptions = options.reduce(
  (acc, opt) => {
    const group = acc[opt.category] || [];
    group.push(opt);
    acc[opt.category] = group;
    return acc;
  },
  {} as Record<Category, Option[]>
);

const roleLabel: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  user: 'Usuario',
};

const roleBadgeClass: Record<UserRole, string> = {
  superadmin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  user: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function MoreScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <ScreenLayout scrollEnabled={false}>
      <View className="w-full flex-1 justify-between px-4 pt-4">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Card onPress={() => router.push('/profile')}>
            <View className="flex-row items-center gap-4">
              <Avatar.Text size={56} label={user?.fullName?.slice(0, 1).toUpperCase() || '?'} />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-slate-900 dark:text-white">{user?.fullName}</Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</Text>
                {user?.role && (
                  <View className={`mt-1 self-start rounded-full px-2.5 py-0.5 ${roleBadgeClass[user.role]}`}>
                    <Text className="text-xs font-medium">{roleLabel[user.role]}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </View>
          </Card>

          <Card className="mb-4 mt-3">
            {(Object.keys(categoryMeta) as Category[]).map((category) => {
              const items = groupedOptions[category];
              if (!items || items.length === 0) return null;
              const meta = categoryMeta[category];

              return (
                <View key={category} className="mb-2">
                  <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {meta.label}
                  </Text>
                  <View className="flex-row flex-wrap">
                    {items.map((opt) => (
                      <TouchableOpacity
                        key={opt.name}
                        onPress={() => router.push(opt.route)}
                        className="w-1/4 items-center justify-center p-2">
                        <View className={`h-14 w-14 items-center justify-center rounded-2xl ${meta.bg}`}>
                          <Ionicons name={opt.icon} size={28} color={meta.iconColor} />
                        </View>
                        <Text className="mt-1.5 text-center text-xs font-medium text-slate-600 dark:text-slate-200">
                          {opt.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </Card>
        </ScrollView>

        <View className="pb-4">
          <TouchableOpacity
            onPress={async () => {
              await serverLogout().catch(() => {});
              disconnectSocket();
              logout();
              router.replace('/login');
            }}
            className="w-full flex-row items-center justify-center gap-3 rounded-full bg-error p-3">
            <Ionicons name="exit-outline" size={22} color="white" />
            <Text className="text-base font-semibold text-white">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}
