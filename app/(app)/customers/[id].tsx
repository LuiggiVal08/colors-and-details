import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import clientService from '@/services/client.service';
import { EditClientForm } from '@/feature/clients/components/EditClientForm';
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

export default function CustomerDetails() {
  const { id } = useLocalSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: client,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id as string),
    enabled: !!id,
  });
  const [visible, setVisible] = useState(false);

  if (isLoading)
    return (
      <View className="flex-1 px-4 py-6">
        <SkeletonLoader count={4} />
      </View>
    );

  if (error || !client)
    return (
      <ErrorRetryCard
        title="No se pudo cargar el cliente"
        message="Hubo un problema al obtener los datos. Revisa tu conexión y vuelve a intentarlo."
        onRetry={refetch}
      />
    );

  return (
    <>
      <Stack.Screen
        options={{
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
                title="Editar Cliente"
              />
            </Menu>
          ),
        }}
      />
      <ScreenLayout centerContent={true}>
      <Card className="mx-4 mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                <Text className="text-3xl font-bold text-slate-700">
                  {formatInitials(client.nombre, client.apellido)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-slate-900">
                  {client.nombre} {client.apellido}
                </Text>
                <Text className="text-base text-slate-500">Cédula: {client.cedula}</Text>
                <View className="flex-row items-center gap-2">
                  <View className={`h-3 w-3 rounded-full ${client.activo ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <Text className="text-sm uppercase tracking-[0.2px] text-slate-500">
                    {client.activo ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Divider className="mb-4" />
          {/* Información adicional con iconos */}
          <View className="mb-4 flex-row items-center gap-3">
            <Ionicons name="mail" size={20} color="#64748b" />
            <Text className="flex-1 text-base text-slate-700">{client.email}</Text>
          </View>
          <View className="mb-4 flex-row items-center gap-3">
            <Ionicons name="call" size={20} color="#64748b" />
            <Text className="flex-1 text-base text-slate-700">{client.telefono}</Text>
          </View>
          <View className="mb-4 flex-row items-center gap-3">
            <Ionicons name="location" size={20} color="#64748b" />
            <Text className="flex-1 text-base text-slate-700">{client.direccion}</Text>
          </View>
          <View className="mb-4 flex-row items-center gap-3">
            <Ionicons name="calendar" size={20} color="#64748b" />
            <Text className="flex-1 text-base text-slate-700">
              Registrado el {new Date(client.fecha_registro).toLocaleDateString()}
            </Text>
          </View>
          {/* Acciones rápidas */}
          <Divider className="my-6" />
          <Text className="mb-4 text-lg font-semibold text-slate-900">Acciones</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-blue-50 p-4"
              onPress={() => {
                const url = `tel:${client.telefono}`;
                Linking.canOpenURL(url).then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'No se puede realizar la llamada.');
                  }
                });
              }}>
              <Ionicons name="call" size={20} color="#2563eb" />
              <Text className="font-medium text-blue-700">Llamar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-green-50 p-4"
              onPress={() => {
                const url = `mailto:${client.email}`;
                Linking.canOpenURL(url).then((supported) => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'No se puede abrir el email.');
                  }
                });
              }}>
              <Ionicons name="mail" size={20} color="#16a34a" />
              <Text className="font-medium text-green-700">Email</Text>
            </TouchableOpacity>
          </View>
          {/* Resumen rápido */}
          <Divider className="my-6" />
          <Text className="mb-4 text-lg font-semibold text-slate-900">Resumen</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 items-center rounded-lg bg-indigo-50 p-4">
              <Ionicons name="document-text" size={24} color="#4338ca" />
              <Text className="mt-2 text-sm text-slate-600">Pedidos</Text>
              <Text className="text-xl font-bold text-indigo-700">0</Text>
            </View>
            <View className="flex-1 items-center rounded-lg bg-emerald-50 p-4">
              <Ionicons name="cash" size={24} color="#059669" />
              <Text className="mt-2 text-sm text-slate-600">Total Gastado</Text>
              <Text className="text-xl font-bold text-emerald-700">$0</Text>
            </View>
          </View>
          </Card>
      </ScreenLayout>

      {/* MODAL DE EDICIÓN */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        statusBarTranslucent={true}
        onDismiss={() => setIsModalOpen(false)}
        onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <EditClientForm initialData={client} onClose={() => setIsModalOpen(false)} onSuccess={() => refetch()} />
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
