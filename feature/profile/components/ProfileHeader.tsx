import { View, Text } from 'react-native';
import { Avatar } from 'react-native-paper';
import InfoTag from '@/components/InfoTag';
import { useAuthStore } from '@/store/auth';

export const ProfileHeader = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <View className="flex w-full max-w-2xl flex-row gap-4 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-primary-dark">
      <Avatar.Text size={65} label={user?.username?.slice(0, 1).toUpperCase() || ''} />
      <View>
        <Text className="text-lg font-semibold text-slate-900 dark:text-white">{user?.fullName || ''}</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">@{user?.username || ''}</Text>
        <View className="flex flex-row gap-2 py-1">
          <InfoTag text={user?.role || ''} className="bg-slate-700" />
          <InfoTag
            text="Activo"
            className={user?.role === 'admin' ? 'bg-slate-700' : 'bg-green-600'}
          />
        </View>
      </View>
    </View>
  );
};
