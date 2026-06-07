import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Switch } from 'react-native-paper';
import type { InventoryTabKey } from '@/feature/inventory/types';

interface InventorySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  tab: InventoryTabKey;
  lowStock: boolean;
  onLowStockToggle: () => void;
  movimientoTipo: '' | 'entrada' | 'salida';
  onMovimientoTipoChange: (value: '' | 'entrada' | 'salida') => void;
}

const placeholderByTab: Record<InventoryTabKey, string> = {
  categorias: 'Buscar categoría...',
  productos: 'Buscar por nombre o código...',
  movimientos: '',
};

const tipoOptions = [
  { label: 'Todos', value: '' },
  { label: 'Entradas', value: 'entrada' },
  { label: 'Salidas', value: 'salida' },
] as const;

export const InventorySearchBar = ({
  value,
  onChangeText,
  tab,
  lowStock,
  onLowStockToggle,
  movimientoTipo,
  onMovimientoTipoChange,
}: InventorySearchBarProps) => {
  const placeholder = placeholderByTab[tab];

  return (
    <View className="gap-3">
      {tab !== 'movimientos' && (
        <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:bg-primary-dark">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className="flex-1 text-base text-slate-900"
            placeholderTextColor="#94A3B8"
            selectionColor="#4DB6AC"
            style={{ minHeight: 42 }}
          />
          {value.length > 0 && (
            <Text className="text-xs text-slate-400">{value.length} caracteres</Text>
          )}
        </View>
      )}

      {tab === 'productos' && (
        <View className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-primary-dark">
          <View className="flex-1 pr-3">
            <Text className="text-sm font-medium text-slate-700">Filtro de stock bajo</Text>
            <Text className="text-xs text-slate-500">Mostrar solo productos con menos de 5 unidades</Text>
          </View>
          <Switch value={lowStock} onValueChange={onLowStockToggle} color="#4DB6AC" />
        </View>
      )}

      {tab === 'movimientos' && (
        <View className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-primary-dark">
          <Text className="mb-2 text-sm font-medium text-slate-700">Filtrar por tipo</Text>
          <View className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-primary-dark">
            <Picker selectedValue={movimientoTipo} onValueChange={onMovimientoTipoChange}>
              {tipoOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );
};
