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
        style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20 }}
        buttons={tabOptions.map((tab) => ({
          value: tab.value,
          label: tab.label,
          icon: tab.icon,
        }))}
      />
    </View>
  );
};
