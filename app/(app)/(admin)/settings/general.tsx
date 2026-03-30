import { Text, View } from 'react-native';
import ScreenLayout from '../../../../components/layout/ScreenLayout';

export default function SettingsGeneralScreen() {
  return (
    <ScreenLayout>
      <View className="w-full max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
        <Text className="mb-4 text-3xl font-bold text-slate-900">General</Text>
        <Text className="text-slate-600">Ajustes generales de la aplicación.</Text>
      </View>
    </ScreenLayout>
  );
}
