import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import employeePayrollService from '@/services/employeePayroll.service';
import type { EmployeeNomina } from '@/types/employee';

interface Props {
  nominas: EmployeeNomina[];
  empleadoId: number;
  onClose: () => void;
}

export const PayrollHistoryModal = ({ nominas, empleadoId, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [localNominas, setLocalNominas] = useState(nominas);

  const deleteMutation = useMutation({
    mutationFn: (nominaId: number) => employeePayrollService.delete(String(nominaId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', String(empleadoId)] });
      queryClient.invalidateQueries({ queryKey: ['employeeDebt', String(empleadoId)] });
    },
  });

  const handleDelete = (item: EmployeeNomina) => {
    Alert.alert(
      'Eliminar pago',
      `¿Eliminar pago del período ${item.fecha_inicio} a ${item.fecha_fin}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(item.id);
            setLocalNominas((prev) => prev.filter((n) => n.id !== item.id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white p-5 pt-12 dark:border-slate-700 dark:bg-primary-dark">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-[#4DB6AC]">Cerrar</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Historial de Pagos</Text>
        <View className="w-12" />
      </View>

      {localNominas.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
          <Text className="mt-4 text-center text-lg font-medium text-slate-600">Sin pagos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={[...localNominas].sort((a, b) => new Date(b.fecha_fin).getTime() - new Date(a.fecha_fin).getTime())}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="p-4"
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-primary-dark">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900">
                    {item.fecha_inicio} — {item.fecha_fin}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-600">
                    Bs. {Number(item.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Text>
                  {item.monto_usd && (
                    <Text className="text-sm text-slate-500">
                      USD {Number(item.monto_usd).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  )}
                  {item.descripcion && (
                    <Text className="mt-1 text-xs text-slate-400">{item.descripcion}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)} className="rounded-full p-2">
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {item.tasa && (
                <View className="mt-2 flex-row items-center gap-1">
                  <Ionicons name="trending-up" size={14} color="#94A3B8" />
                  <Text className="text-xs text-slate-400">
                    Tasa: Bs. {Number(item.tasa.tasa).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};
