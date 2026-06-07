import { View, Text } from 'react-native';
import { impactLight } from '@/helpers/haptics';
import type { Employee } from '@/types/employee';
import Card from '@/components/Card';

interface EmployeeCardProps {
  employee: Employee;
  onPress?: () => void;
}

export const EmployeeCard = ({ employee, onPress }: EmployeeCardProps) => {
  const handlePress = () => {
    impactLight();
    onPress?.();
  };

  const formatInitials = (nombre: string, apellido: string) => {
    const first = nombre.trim().charAt(0).toUpperCase();
    const last = apellido.trim().charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  return (
    <Card className="mb-4 p-4" onPress={handlePress}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Text className="text-lg font-bold text-slate-700">
                {formatInitials(employee.nombre, employee.apellido)}
              </Text>
            </View>
            <View className="min-w-0">
              <Text className="truncate text-lg font-semibold text-slate-900">
                {employee.nombre} {employee.apellido}
              </Text>
              <Text className="text-sm text-slate-500">Cédula: {employee.cedula}</Text>
            </View>
          </View>
          <View className="mt-3 space-y-1">
            <Text className="text-sm text-slate-500">Teléfono: {employee.telefono}</Text>
            <Text className="text-sm text-slate-500">Email: {employee.email}</Text>
          </View>
        </View>
        <View className={`h-3 w-3 rounded-full ${employee.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      </View>
    </Card>
  );
};
