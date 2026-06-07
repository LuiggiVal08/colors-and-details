import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import type { InventoryTabKey } from '@/feature/inventory/types';

interface InventoryTabsProps {
  value: InventoryTabKey;
  onValueChange: (value: InventoryTabKey) => void;
}

const tabOptions = [
  { value: 'categorias', label: 'Categorías', icon: 'tag-outline' },
  { value: 'productos', label: 'Productos', icon: 'tag' },
  { value: 'movimientos', label: 'Movimientos', icon: 'swap-horizontal' },
] as const;

export const InventoryTabs = ({ value, onValueChange }: InventoryTabsProps) => {
  return (
    <View className="w-full">
      <SegmentedButtons
        value={value}
        onValueChange={onValueChange}
        className="bg-white/95 dark:bg-primary-dark/95"
        style={{ borderRadius: 20 }}
        buttons={tabOptions.map((tab) => ({
          value: tab.value,
          label: tab.label,
          icon: tab.icon,
        }))}
      />
    </View>
  );
};
