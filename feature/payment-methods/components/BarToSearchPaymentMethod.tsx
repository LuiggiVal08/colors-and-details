import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { selection } from '@/helpers/haptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  tipo: string;
  onTipoChange: (tipo: string) => void;
  placeholder?: string;
}

const tipos = [
  { label: 'Todos', value: '' },
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta', value: 'tarjeta' },
  { label: 'Digital', value: 'digital' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Otro', value: 'otro' },
];

const getFilterIcon = (tipo: string) => {
  switch (tipo) {
    case 'efectivo':
      return 'cash';
    case 'tarjeta':
      return 'card';
    case 'digital':
      return 'phone-portrait';
    case 'transferencia':
      return 'swap-horizontal';
    case 'otro':
      return 'help-circle';
    default:
      return 'funnel-outline';
  }
};

const BarToSearchPaymentMethod = ({
  value,
  onChangeText,
  tipo,
  onTipoChange,
  placeholder = 'Buscar métodos de pago...',
}: SearchBarProps) => {
  const [openFilter, setOpenFilter] = useState(false);
  const selectedTipo = tipos.find((t) => t.value === tipo)?.label || 'Todos';

  return (
    <View className="mx-0 w-full bg-white p-4 shadow-lg shadow-slate-200/80 dark:bg-primary-dark">
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
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

        <Pressable
          onPress={() => {
            selection();
            setOpenFilter((prev) => !prev);
          }}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100"
          style={{ minWidth: 48 }}>
          <Ionicons name={getFilterIcon(tipo)} size={24} color="#475569" />
        </Pressable>
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-sm text-slate-500">Filtrar por tipo:</Text>
        <Text className="text-sm font-medium text-slate-700">{selectedTipo}</Text>
      </View>

      {openFilter ? (
        <View className="mt-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
          {tipos.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                selection();
                onTipoChange(option.value);
                setOpenFilter(false);
              }}
              className="rounded-2xl px-3 py-3"
              style={{ backgroundColor: tipo === option.value ? '#DEF7EC' : 'transparent' }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-700">{option.label}</Text>
                {tipo === option.value ? <Ionicons name="checkmark" size={18} color="#22C55E" /> : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default BarToSearchPaymentMethod;
