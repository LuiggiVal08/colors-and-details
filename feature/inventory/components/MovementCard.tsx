import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InventoryMovement } from '@/feature/inventory/types';
import { selection } from '@/helpers/haptics';
import Card from '@/components/Card';

interface MovementCardProps {
  movement: InventoryMovement;
  onPress?: (movement: InventoryMovement) => void;
}

const formatFecha = (fecha: string) => {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MovementCard = ({ movement, onPress }: MovementCardProps) => {
  const handlePress = () => {
    if (!onPress) return;
    selection();
    onPress(movement);
  };

  const isEntrada = movement.tipo === 'entrada';

  return (
    <Card
      className="mx-4 mb-2 rounded-2xl p-4"
      onPress={handlePress}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <View
              className={`h-7 w-7 items-center justify-center rounded-full ${
                isEntrada ? 'bg-emerald-100' : 'bg-rose-100'
              }`}>
              <Ionicons
                name={isEntrada ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={isEntrada ? '#059669' : '#E11D48'}
              />
            </View>
            <Text className="truncate text-base font-semibold text-slate-900">
              {movement.producto}
            </Text>
          </View>
          {movement.motivo && <Text className="mt-1 text-sm text-slate-500">{movement.motivo}</Text>}
        </View>
        <View
          className={`rounded-full px-2.5 py-1 ${
            isEntrada ? 'bg-emerald-100' : 'bg-rose-100'
          }`}>
          <Text
            className={`text-xs font-semibold ${
              isEntrada ? 'text-emerald-700' : 'text-rose-700'
            }`}>
            {isEntrada ? '+' : '−'}
            {movement.cantidad}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs text-slate-400">{formatFecha(movement.fecha)}</Text>
        {onPress && <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />}
      </View>
    </Card>
  );
};
