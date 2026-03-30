import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Slot initialRouteName="login" />
    </SafeAreaView>
  );
}
