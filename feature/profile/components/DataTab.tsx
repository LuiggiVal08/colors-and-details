import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { getEmployeeByUserId } from '@/services/employee.service';
import { EmployeeForm } from './EmployeeForm'; // Componente que crearemos

export const DataTab = () => {
  const id = useAuthStore((state) => state.user?.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeByUserId(id!),
    enabled: !!id,
  });

  if (isLoading) return <Text className="p-5">Cargando datos...</Text>;
  if (!data) return <Text className="p-5">No se encontró información.</Text>;

  return (
    <>
      {/* CARD DE INFORMACIÓN */}
      <View className="">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">Mi Perfil</Text>
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            className="rounded-full bg-blue-600 px-5 py-2 shadow-sm">
            <Text className="font-semibold text-white">Editar Datos</Text>
          </TouchableOpacity>
        </View>

        {/* SECCIÓN 1: Identificación y Estado */}
        <View className="mb-4 ">
          <Text className="mb-2 text-xs font-bold uppercase text-gray-400">
            Información de Cuenta
          </Text>
          <InfoRow label="ID de Empleado" value={`#${data.id}`} />
          <View className="flex-row items-center justify-between border-b border-gray-50 py-3">
            <Text className="text-sm text-gray-500">Estado Actual</Text>
            <View
              className={`rounded-full px-3 py-1 ${data.activo ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text
                className={`text-xs font-bold ${data.activo ? 'text-green-700' : 'text-red-700'}`}>
                {data.activo ? 'ACTIVO' : 'INACTIVO'}
              </Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 2: Datos Personales */}
        <View className="mb-4 ">
          <Text className="mb-2 text-xs font-bold uppercase text-gray-400">Datos Personales</Text>
          <InfoRow label="Nombre Completo" value={`${data.nombre} ${data.apellido}`} />
          <InfoRow label="Cédula de Identidad" value={data.cedula} />
          <InfoRow label="Dirección" value={data.direccion} />
        </View>

        {/* SECCIÓN 3: Contacto */}
        <View className="mb-4 ">
          <Text className="mb-2 text-xs font-bold uppercase text-gray-400">Contacto</Text>
          <InfoRow label="Correo Electrónico" value={data.email} />
          <InfoRow label="Teléfono" value={data.telefono} />
        </View>

        {/* SECCIÓN 4: Información Laboral */}
        <View className="mb-4 ">
          <Text className="mb-2 text-xs font-bold uppercase text-gray-400">Contrato</Text>
          <InfoRow
            label="Fecha de Ingreso"
            value={new Date(data.fecha_ingreso).toLocaleDateString()}
          />
          <InfoRow label="Salario Base" value={`$${Number(data.salario_base).toLocaleString()}`} />
        </View>
      </View>

      {/* MODAL DE EDICIÓN */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onDismiss={() => setIsModalOpen(false)}>
        <EmployeeForm initialData={data} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

// Componente auxiliar para filas de información
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="border-b border-gray-100 py-3">
    <Text className="text-sm text-gray-500">{label}</Text>
    <Text className="text-base font-medium text-gray-900">{value}</Text>
  </View>
);
