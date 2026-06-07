import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import exchangeRateService from '@/services/exchangeRate.service';
import { useExchangeRateStore } from '@/store/exchangeRate';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { Snackbar, TextInput } from 'react-native-paper';

export default function TasaScreen() {
  const queryClient = useQueryClient();
  const storeTasa = useExchangeRateStore((s) => s.tasa);
  const [showForm, setShowForm] = useState(false);
  const [nuevaTasa, setNuevaTasa] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { data: current, isLoading: loadingCurrent } = useQuery({
    queryKey: ['exchange-rate', 'actual'],
    queryFn: () => exchangeRateService.getActual(),
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['exchange-rate', 'history'],
    queryFn: () => exchangeRateService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (tasa: number) => exchangeRateService.create(tasa),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rate'] });
      useExchangeRateStore.getState().setTasa(data.tasa, data.cambio);
      setShowForm(false);
      setNuevaTasa('');
      setSnackbar({ visible: true, message: 'Tasa actualizada correctamente' });
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'Error al actualizar tasa' });
    },
  });

  const handleSubmit = () => {
    const val = parseFloat(nuevaTasa);
    if (isNaN(val) || val <= 0) {
      setSnackbar({ visible: true, message: 'Ingrese una tasa válida (> 0)' });
      return;
    }
    createMutation.mutate(val);
  };

  const displayTasa = current?.tasa ?? storeTasa;

  return (
    <>
      <Stack.Screen options={{ title: 'Tasa de Dólar' }} />
      <ScreenLayout scrollEnabled={false}>
        <ScrollView className="w-full flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <Card className="mb-6 p-5">
            <View className="mb-4 flex-row items-center gap-3">
              <View className="rounded-xl bg-amber-100 p-2">
                <Ionicons name="cash-outline" size={22} color="#F59E0B" />
              </View>
              <Text className="text-xl font-bold text-slate-900">Tasa de Dólar</Text>
            </View>

            {loadingCurrent ? (
              <ActivityIndicator size="small" color="#4DB6AC" />
            ) : displayTasa ? (
              <View className="gap-2">
                <View className="flex-row items-center justify-between rounded-lg bg-slate-50 p-3">
                  <Text className="text-sm text-slate-500">Tasa actual</Text>
                  <View>
                    <Text className="text-right text-2xl font-bold text-[#4DB6AC]">
                      Bs. {Number(displayTasa).toFixed(2)}
                    </Text>
                    {current?.cambio && (
                      <Text className="text-right text-xs text-slate-400">
                        Cambio: {current.cambio}
                      </Text>
                    )}
                  </View>
                </View>
                {current?.fecha && (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                    <Text className="text-xs text-slate-400">
                      Actualizado: {new Date(current.fecha).toLocaleDateString('es-VE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
                {current?.usuario && (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="person-outline" size={14} color="#94A3B8" />
                    <Text className="text-xs text-slate-400">Por: {current.usuario.nombre}</Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-sm text-slate-400">No hay tasa registrada</Text>
            )}
          </Card>

          {!showForm ? (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="mb-6 flex-row items-center justify-center gap-2 rounded-2xl bg-[#4DB6AC] py-4">
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text className="text-base font-semibold text-white">Actualizar Tasa</Text>
            </TouchableOpacity>
          ) : (
            <Card className="mb-6 p-5">
              <Text className="mb-4 text-lg font-bold text-slate-900">Nueva Tasa</Text>
              <TextInput
                label="Tasa (Bs. por 1 USD)"
                value={nuevaTasa}
                onChangeText={setNuevaTasa}
                keyboardType="decimal-pad"
                mode="outlined"
                className="mb-4 bg-white"
                placeholder="Ej: 50.25"
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => { setShowForm(false); setNuevaTasa(''); }}
                  className="flex-1 rounded-2xl bg-slate-200 py-3">
                  <Text className="text-center text-base font-semibold text-slate-600">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={createMutation.isPending || !nuevaTasa}
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
                      <Text className="text-lg font-bold text-slate-900">
                        Bs. {Number(item.tasa).toFixed(2)}
                      </Text>
                      {item.activa && (
                        <View className="rounded-full bg-emerald-100 px-2 py-0.5">
                          <Text className="text-xs font-medium text-emerald-700">Activa</Text>
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
