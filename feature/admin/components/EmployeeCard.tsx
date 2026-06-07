import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { impactLight } from '@/helpers/haptics';
import type { Employee } from '@/store/employees';
import Card from '@/components/Card';

interface EmployeeCardProps {
  employee: Employee;
  onToggleActive: () => void;
  onTogglePricePermission: () => void;
}

export const EmployeeCard = ({ employee, onToggleActive }: EmployeeCardProps) => {
  const handleToggleActive = () => {
    impactLight();
    onToggleActive();
  };

  return (
    <Card className="mb-4 p-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Ionicons name="person-circle" size={24} color="#475569" />
            </View>
            <View className="min-w-0">
              <Text className="truncate text-lg font-semibold text-slate-900">{employee.nombre}</Text>
              <Text className="text-sm uppercase tracking-[0.4px] text-slate-500">
                {employee.role === 'admin' ? 'Administrador' : 'Empleado'}
              </Text>
            </View>
          </View>
          <View className="mt-3 space-y-1">
            <Text className="text-sm text-slate-500">Correo: {employee.correo}</Text>
            <Text className="text-sm text-slate-500">Teléfono: {employee.telefono}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleToggleActive} className="rounded-full bg-slate-100 px-3 py-2">
          <Text className="text-sm font-semibold text-slate-700">{employee.active ? 'Activo' : 'Inactivo'}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};
