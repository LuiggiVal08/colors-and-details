import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import employeeService from '@/services/employee.service';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { Divider, Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import SkeletonLoader from '@/components/SkeletonLoader';

const formatInitials = (nombre: string, apellido: string) => {
  const first = nombre.trim().charAt(0).toUpperCase();
  const last = apellido.trim().charAt(0).toUpperCase();
  return `${first}${last}`;
};

export default function EmployeeDetails() {
  const { id } = useLocalSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <Stack.Screen options={{ title: `${employee.nombre} ${employee.apellido}` }} />
      <ScreenLayout>
        <View className="w-full max-w-5xl px-4 py-6">
          <View className="mb-6 rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-200/80">
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
          </View>

          <View className="mb-6 rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-200/80">
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
          </View>

          <View className="mb-6 rounded-3xl bg-white/95 p-6 shadow-lg shadow-slate-200/80">
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
            </View>
          </View>
        </View>
      </ScreenLayout>
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-xl font-bold text-slate-900">Editar empleado</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {/* Aquí iría el formulario de edición */}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
