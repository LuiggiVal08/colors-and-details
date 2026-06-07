import { View, Text } from 'react-native';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Ionicons } from '@expo/vector-icons';

export default function BackupScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl px-4 py-6">
        <View className="items-center rounded-[32px] bg-white p-8 dark:bg-primary-dark">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Ionicons name="cloud-upload-outline" size={32} color="#F97316" />
          </View>
          <Text className="mb-2 text-2xl font-bold text-slate-900">Respaldo</Text>
          <Text className="text-center text-base leading-6 text-slate-500">
            La gestión de respaldos está disponible solo desde la versión web.
          </Text>
        </View>
      </View>
    </ScreenLayout>
  );
}
