import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { impactLight } from '@/helpers/haptics';
import type { ClientCardProps } from '@/feature/clients/types';
import Card from '@/components/Card';

const formatInitials = (nombre: string, apellido: string) => {
  const first = nombre.trim().charAt(0).toUpperCase();
  const last = apellido.trim().charAt(0).toUpperCase();
  return `${first}${last}`;
};

const CardClient = ({ client, onPress }: ClientCardProps) => {
  const handlePress = () => {
    impactLight();
    onPress?.(client);
  };

  return (
    <Card className="mx-4 mb-3" onPress={handlePress}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Text className="text-xl font-bold text-slate-700">{formatInitials(client.nombre, client.apellido)}</Text>
          </View>
          <View>
            <Text className="text-base font-semibold text-slate-900">
              {client.nombre} {client.apellido}
            </Text>
            <Text className="text-sm text-slate-500">Cédula: {client.cedula}</Text>
            <Text className="text-sm text-slate-500">Teléfono: {client.telefono}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#334155" />
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <View className={`h-2.5 w-2.5 rounded-full ${client.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <Text className="text-xs uppercase tracking-[0.2px] text-slate-500">
          {client.activo ? 'Activo' : 'Inactivo'}
        </Text>
      </View>
    </Card>
  );
};

export default CardClient;
