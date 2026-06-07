import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useBoxRegisterStore } from '@/store/boxRegister';
import { useExchangeRateStore } from '@/store/exchangeRate';

export default function MiniHeader() {
  const router = useRouter();
  const { activeBox } = useBoxRegisterStore();
  const tasa = useExchangeRateStore((state) => state.tasa);

  const formattedTasa = tasa
    ? tasa.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  return (
    <View className="mb-2 flex-row items-center justify-between rounded-2xl bg-white/80 px-3 py-2 dark:bg-primary-dark/80">
      <TouchableOpacity
        onPress={() => router.push(activeBox ? `/box-register/${activeBox.caja_id}` : '/box-register')}
        className="flex-row items-center gap-1.5">
        <View className={`h-2 w-2 rounded-full ${activeBox ? 'bg-success' : 'bg-error'}`} />
        <Text className={`text-xs font-medium ${activeBox ? 'text-success' : 'text-error'}`}>
          {activeBox ? `Caja · ${activeBox.caja_nombre || 'Abierta'}` : 'Sin caja abierta'}
        </Text>
      </TouchableOpacity>

      {formattedTasa && (
        <Text className="text-xs text-slate-500 dark:text-slate-400">1 USD = {formattedTasa} Bs</Text>
      )}
    </View>
  );
}
