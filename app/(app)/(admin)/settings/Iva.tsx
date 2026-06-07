import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ivaService from '@/services/iva.service';
import { useIVAStore } from '@/store/iva';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { Snackbar, TextInput } from 'react-native-paper';

export default function IvaScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [porcentaje, setPorcentaje] = useState('');
  const [observacion, setObservacion] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { data: current, isLoading: loadingCurrent } = useQuery({
    queryKey: ['iva', 'actual'],
    queryFn: () => ivaService.getActual(),
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['iva', 'history'],
    queryFn: () => ivaService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (params: { porcentaje: number; observacion?: string }) =>
      ivaService.create(params.porcentaje, params.observacion),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['iva'] });
      useIVAStore.getState().setActual(data.id, data.porcentaje);
      setShowForm(false);
      setPorcentaje('');
      setObservacion('');
      setSnackbar({ visible: true, message: 'IVA actualizado correctamente' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al actualizar IVA' });
    },
  });

  const handleSubmit = () => {
    const val = parseFloat(porcentaje);
    if (isNaN(val) || val < 0) {
      setSnackbar({ visible: true, message: 'Ingrese un porcentaje válido' });
      return;
    }
    createMutation.mutate({ porcentaje: val, observacion: observacion || undefined });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'IVA' }} />
      <ScreenLayout scrollEnabled={false}>
        <ScrollView className="w-full flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <Card className="mb-6 p-5">
            <View className="mb-4 flex-row items-center gap-3">
              <View className="rounded-xl bg-purple-100 p-2">
                <Ionicons name="receipt-outline" size={22} color="#8B5CF6" />
              </View>
              <Text className="text-xl font-bold text-slate-900">IVA</Text>
            </View>

            {loadingCurrent ? (
              <ActivityIndicator size="small" color="#4DB6AC" />
            ) : current ? (
              <View className="gap-2">
                <View className="flex-row items-center justify-between rounded-lg bg-slate-50 p-3">
                  <Text className="text-sm text-slate-500">Porcentaje actual</Text>
                  <Text className="text-2xl font-bold text-[#4DB6AC]">{current.porcentaje}%</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                  <Text className="text-xs text-slate-400">
                    Actualizado: {new Date(current.fecha).toLocaleDateString('es-VE')}
                  </Text>
                </View>
                {current.usuario && (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="person-outline" size={14} color="#94A3B8" />
                    <Text className="text-xs text-slate-400">Por: {current.usuario.nombre}</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-sm text-slate-400">No hay IVA registrado</Text>
            )}
          </Card>

          {!showForm ? (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="mb-6 flex-row items-center justify-center gap-2 rounded-2xl bg-[#4DB6AC] py-4">
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text className="text-base font-semibold text-white">Actualizar IVA</Text>
            </TouchableOpacity>
          ) : (
            <Card className="mb-6 p-5">
              <Text className="mb-4 text-lg font-bold text-slate-900">Nuevo IVA</Text>
              <TextInput
                label="Porcentaje"
                value={porcentaje}
                onChangeText={setPorcentaje}
                keyboardType="decimal-pad"
                mode="outlined"
                className="mb-3 bg-white"
                placeholder="Ej: 16"
              />
              <TextInput
                label="Observación (opcional)"
                value={observacion}
                onChangeText={setObservacion}
                mode="outlined"
                className="mb-4 bg-white"
                placeholder="Motivo del cambio"
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => { setShowForm(false); setPorcentaje(''); setObservacion(''); }}
                  className="flex-1 rounded-2xl bg-slate-200 py-3">
                  <Text className="text-center text-base font-semibold text-slate-600">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={createMutation.isPending || !porcentaje}
                  className="flex-1 rounded-2xl bg-[#4DB6AC] py-3 disabled:opacity-50">
                  <Text className="text-center text-base font-semibold text-white">
                    {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          <Card className="p-5">
            <Text className="mb-4 text-lg font-bold text-slate-900">Historial</Text>
            {loadingHistory ? (
              <ActivityIndicator size="small" color="#4DB6AC" />
            ) : history.length === 0 ? (
              <Text className="text-sm text-slate-400">Sin cambios registrados</Text>
            ) : (
              history.map((item) => (
                <View
                  key={item.id}
                  className="mb-2 flex-row items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-700 dark:bg-primary-dark">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-bold text-slate-900">{item.porcentaje}%</Text>
                      {item.activo && (
                        <View className="rounded-full bg-emerald-100 px-2 py-0.5">
                          <Text className="text-xs font-medium text-emerald-700">Activo</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-slate-400">
                      {new Date(item.fecha).toLocaleDateString('es-VE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {item.observacion && (
                      <Text className="mt-1 text-xs text-slate-400">{item.observacion}</Text>
                    )}
                    {item.usuario && (
                      <Text className="text-xs text-slate-400">Por: {item.usuario.nombre}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </Card>
        </ScrollView>
      </ScreenLayout>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}>
        {snackbar.message}
      </Snackbar>
    </>
  );
}
