import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import employeeService from '@/services/employee.service';
import employeeDebtService from '@/services/employeeDebt.service';
import { EditEmployeeForm } from '@/feature/employees/components/EditEmployeeForm';
import { RegisterPayrollModal } from '@/feature/employees/components/RegisterPayrollModal';
import { PayrollHistoryModal } from '@/feature/employees/components/PayrollHistoryModal';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Divider, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import Card from '@/components/Card';

const formatInitials = (nombre: string, apellido: string) => {
  const first = nombre.trim().charAt(0).toUpperCase();
  const last = apellido.trim().charAt(0).toUpperCase();
  return `${first}${last}`;
};

export default function EmployeeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const {
    data: employee,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getById(id as string),
    enabled: !!id,
  });

  const { data: debt } = useQuery({
    queryKey: ['employeeDebt', id],
    queryFn: () => employeeDebtService.getById(Number(id)),
    enabled: !!id,
  });

  const [visible, setVisible] = useState(false);

  if (isLoading)
    return (
      <View className="flex-1 px-4 py-6">
        <SkeletonLoader count={4} />
      </View>
    );

  if (error || !employee)
    return (
      <ErrorRetryCard
        title="No se pudo cargar el empleado"
        message="Hubo un problema al obtener los datos. Revisa tu conexión y vuelve a intentarlo."
        onRetry={refetch}
      />
    );

  const handleCall = () => {
    const phoneNumber = `tel:${employee.telefono}`;
    Linking.canOpenURL(phoneNumber).then((supported) => {
      if (supported) {
        Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'No se puede realizar la llamada desde este dispositivo');
      }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Empleado',
      `¿Estás seguro de eliminar a ${employee.nombre} ${employee.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeService.delete(id as string);
              queryClient.invalidateQueries({ queryKey: ['employees'] });
              router.back();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el empleado. Verifica que no tenga pagos o usuarios asociados.');
            }
          },
        },
      ]
    );
  };

  const handleEmail = () => {
    const email = `mailto:${employee.email}`;
    Linking.canOpenURL(email).then((supported) => {
      if (supported) {
        Linking.openURL(email);
      } else {
        Alert.alert('Error', 'No se puede enviar el correo desde este dispositivo');
      }
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: employee ? `Empleado: ${employee.nombre} ${employee.apellido}` : 'Empleado',
          headerRight: () => (
            <Menu
              visible={visible}
              anchorPosition="bottom"
              onDismiss={() => setVisible(false)}
              theme={{ colors: { elevation: { level2: '#fff' } } }}
              anchor={
                <TouchableOpacity onPress={() => setVisible(true)} className="mr-3">
                  <Ionicons name="ellipsis-vertical" size={24} />
                </TouchableOpacity>
              }>
              <Menu.Item
                onPress={() => {
                  setIsModalOpen(true);
                  setVisible(false);
                }}
                leadingIcon="account"
                title="Editar Empleado"
              />
              <Menu.Item
                onPress={() => {
                  setVisible(false);
                  handleDelete();
                }}
                leadingIcon="delete"
                title="Eliminar Empleado"
              />
            </Menu>
          ),
        }}
      />
      <ScreenLayout centerContent={false} scrollEnabled={true}>
        <View className="w-full max-w-5xl px-4 py-6">
          <Card className="mb-6">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Text className="text-2xl font-bold text-slate-700">
                  {formatInitials(employee.nombre, employee.apellido)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-900">
                  {employee.nombre} {employee.apellido}
                </Text>
                <Text className="text-sm text-slate-500">Cédula: {employee.cedula}</Text>
              </View>
              <View className={`h-3 w-3 rounded-full ${employee.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </View>
          </Card>

          <Card className="mb-6">
            <Text className="mb-4 text-xl font-bold text-slate-900">Información de contacto</Text>
            <View className="gap-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="call-outline" size={20} color="#64748B" />
                <Text className="flex-1 text-base text-slate-700">{employee.telefono}</Text>
                <TouchableOpacity onPress={handleCall} className="rounded-full bg-[#4DB6AC] p-2">
                  <Ionicons name="call" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <Divider />
              <View className="flex-row items-center gap-3">
                <Ionicons name="mail-outline" size={20} color="#64748B" />
                <Text className="flex-1 text-base text-slate-700">{employee.email}</Text>
                <TouchableOpacity onPress={handleEmail} className="rounded-full bg-[#4DB6AC] p-2">
                  <Ionicons name="mail" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <Divider />
              <View className="flex-row items-center gap-3">
                <Ionicons name="location-outline" size={20} color="#64748B" />
                <Text className="flex-1 text-base text-slate-700">{employee.direccion}</Text>
              </View>
            </View>
          </Card>

          <Card className="mb-6">
            <Text className="mb-4 text-xl font-bold text-slate-900">Información laboral</Text>
            <View className="gap-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="calendar-outline" size={20} color="#64748B" />
                <Text className="flex-1 text-base text-slate-700">
                  Fecha de ingreso: {new Date(employee.fecha_ingreso).toLocaleDateString()}
                </Text>
              </View>
              <Divider />
              <View className="flex-row items-center gap-3">
                <Ionicons name="cash-outline" size={20} color="#64748B" />
                <Text className="flex-1 text-base text-slate-700">Salario base: {employee.salario_base}</Text>
              </View>
              <Divider />
              <View className="flex-row items-center gap-3">
                <Ionicons name="repeat-outline" size={20} color="#64748B" />
                <Text className="flex-1 text-base text-slate-700">
                  Frecuencia: {employee.frecuencia_pago === 'mensual' ? 'Mensual' : employee.frecuencia_pago === 'quincenal' ? 'Quincenal' : 'Semanal'}
                </Text>
              </View>
            </View>
          </Card>
          <Card className="mb-6">
            <Text className="mb-4 text-xl font-bold text-slate-900">Gestión de Nómina</Text>

            {debt && (
              <View className="mb-4 gap-3">
                <View className="flex-row items-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <Ionicons name="alert-circle" size={20} color="#D97706" />
                  <Text className="flex-1 text-sm text-amber-700 dark:text-amber-300">
                    Deuda total: Bs. {Number(debt.deuda).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1 rounded-lg bg-slate-100 p-3 dark:bg-neutral-800">
                    <Text className="text-xs text-slate-500">Pagados</Text>
                    <Text className="text-lg font-bold text-slate-900">{debt.periodos_pagados}</Text>
                  </View>
                  <View className="flex-1 rounded-lg bg-slate-100 p-3 dark:bg-neutral-800">
                    <Text className="text-xs text-slate-500">Vencidos</Text>
                    <Text className="text-lg font-bold text-error">{debt.periodos_vencidos}</Text>
                  </View>
                  <View className="flex-1 rounded-lg bg-slate-100 p-3 dark:bg-neutral-800">
                    <Text className="text-xs text-slate-500">Días sin pago</Text>
                    <Text className="text-lg font-bold text-slate-900">{debt.dias_sin_pago}</Text>
                  </View>
                </View>
              </View>
            )}

            {debt?.ultimo_pago ? (
              <View className="mb-4 flex-row items-center justify-between rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
                <View>
                  <Text className="text-xs text-slate-500">Último pago</Text>
                  <Text className="text-sm font-semibold text-slate-900">
                    Bs. {Number(debt.ultimo_pago.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500">
                  {new Date(debt.ultimo_pago.fecha_fin).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <View className="mb-4 rounded-lg bg-slate-50 p-3 dark:bg-neutral-800">
                <Text className="text-center text-sm text-slate-500">Sin pagos registrados</Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsPayModalOpen(true)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#4DB6AC] px-4 py-3">
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text className="text-center text-sm font-semibold text-white">Registrar pago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsHistoryModalOpen(true)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-[#4DB6AC] px-4 py-3">
                <Ionicons name="list-outline" size={20} color="#4DB6AC" />
                <Text className="text-center text-sm font-semibold text-[#4DB6AC]">Historial</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
        <Modal visible={isModalOpen} animationType="slide" statusBarTranslucent={true}>
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <EditEmployeeForm initialData={employee} onClose={() => setIsModalOpen(false)} />
          </KeyboardAvoidingView>
        </Modal>
        <Modal visible={isPayModalOpen} animationType="slide" statusBarTranslucent={true}>
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <RegisterPayrollModal empleadoId={employee.id} debt={debt} onClose={() => setIsPayModalOpen(false)} />
          </KeyboardAvoidingView>
        </Modal>
        <Modal visible={isHistoryModalOpen} animationType="slide" statusBarTranslucent={true}>
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <PayrollHistoryModal
              nominas={employee.nominas || []}
              empleadoId={employee.id}
              onClose={() => setIsHistoryModalOpen(false)}
            />
          </KeyboardAvoidingView>
        </Modal>
      </ScreenLayout>
    </>
  );
}
