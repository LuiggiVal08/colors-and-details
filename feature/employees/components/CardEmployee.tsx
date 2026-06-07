import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { impactLight } from '@/helpers/haptics';
import type { EmployeeCardProps } from '@/feature/employees/types';
import Card from '@/components/Card';

const formatInitials = (nombre: string, apellido: string) => {
  const first = nombre.trim().charAt(0).toUpperCase();
  const last = apellido.trim().charAt(0).toUpperCase();
  return `${first}${last}`;
};

const CardEmployee = ({ employee, onPress }: EmployeeCardProps) => {
  const handlePress = () => {
    impactLight();
    onPress?.(employee);
  };

  return (
    <Card className="mx-4 mb-3" onPress={handlePress}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Text className="text-xl font-bold text-slate-700">
              {formatInitials(employee.nombre, employee.apellido)}
            </Text>
          </View>
          <View>
            <Text className="text-base font-semibold text-slate-900">
              {employee.nombre} {employee.apellido}
            </Text>
            <Text className="text-sm text-slate-500">Cédula: {employee.cedula}</Text>
            <Text className="text-sm text-slate-500">Teléfono: {employee.telefono}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#334155" />
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <View className={`h-2.5 w-2.5 rounded-full ${employee.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <Text className="text-xs uppercase tracking-[0.2px] text-slate-500">
          {employee.activo ? 'Activo' : 'Inactivo'}
        </Text>
      </View>
    </Card>
  );
};

export default CardEmployee;
