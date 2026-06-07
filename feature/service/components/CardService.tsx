import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/Card';
import { impactLight } from '@/helpers/haptics';
import type { Servicio } from '@/types/service';

interface CardServiceProps {
  servicio: Servicio;
  onEdit: (servicio: Servicio) => void;
  onPress?: (servicio: Servicio) => void;
}

const CardService = ({ servicio, onEdit, onPress }: CardServiceProps) => {
  const precioActual = servicio.precios?.[0]?.precio;

  const handleEdit = async () => {
    impactLight();
    onEdit(servicio);
  };

  const handlePress = () => {
    onPress?.(servicio);
  };

  return (
    <Card className="mx-4 mb-4">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handlePress}
          className="min-w-0 flex-1 flex-row items-center gap-4"
          activeOpacity={0.7}>
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Ionicons name="construct" size={24} color="#64748b" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold text-slate-900" numberOfLines={1} ellipsizeMode="tail">
              {servicio.nombre}
            </Text>
            {servicio.proveedor ? (
              <Text className="text-sm text-slate-500" numberOfLines={1} ellipsizeMode="tail">
                {servicio.proveedor}
              </Text>
            ) : null}
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-slate-500">Corte dia {servicio.dia_corte}</Text>
              {precioActual ? (
                <>
                  <Text className="text-sm text-slate-300">|</Text>
                  <Text className="text-sm font-medium text-emerald-600">${precioActual}</Text>
                </>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEdit} className="rounded-full p-2" activeOpacity={0.7}>
          <Ionicons name="pencil" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

export default CardService;
