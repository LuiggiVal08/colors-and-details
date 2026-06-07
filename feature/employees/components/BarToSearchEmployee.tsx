import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { selection } from '@/helpers/haptics';
import type { SearchBarProps } from '@/feature/employees/types';

const BarToSearchEmployee = ({ value, onChangeText, placeholder = 'Buscar empleados...' }: SearchBarProps) => {
  return (
    <View className="mx-0 w-full bg-white p-4 shadow-lg shadow-slate-200/80 dark:bg-primary-dark">
      <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Ionicons name="search" size={22} color="#94A3B8" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          selectionColor="#4DB6AC"
          className="ml-3 flex-1 text-base text-slate-900"
          style={{ minHeight: 40 }}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value ? (
          <Pressable
            onPress={() => {
              selection();
              onChangeText('');
            }}
            className="rounded-full p-2">
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default BarToSearchEmployee;
