import { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native-paper';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/Card';
import boxRegisterService from '@/services/boxRegister.service';
import { useBoxRegisterStore } from '@/store/boxRegister';
import CreateBoxModal, { type CreateBoxModalRef } from '@/components/CreateBoxModal';
import ExpandableFAB from '@/components/ExpandableFAB';

function BoxItem({
  item,
  activeBoxId,
}: {
  item: {
    id: number;
    nombre: string;
    descripcion?: string;
    ubicacion?: string;
    monto: number;
    activo: boolean;
  };
  activeBoxId?: number | null;
}) {
  const router = useRouter();
  const isActive = item.activo;
  const isMyActiveBox = activeBoxId === item.id;

  return (
    <Card
      className={`mx-0 mb-3 p-4 ${isMyActiveBox ? 'border border-info/30' : ''}`}
      onPress={() => router.push(`/box-register/${item.id}`)}>
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-slate-900 dark:text-white">{item.nombre}</Text>
            <View
              className={`rounded-full px-2 py-0.5 ${
                isActive ? 'bg-success/10' : 'bg-slate-100 dark:bg-primary-dark'
              }`}>
              <Text
                className={`text-[10px] font-semibold ${
                  isActive ? 'text-success' : 'text-slate-500 dark:text-slate-400'
                }`}>
                {isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            {isMyActiveBox && (
              <View className="rounded-full bg-info/10 px-2 py-0.5">
                <Text className="text-[10px] font-semibold text-info">Mi Caja</Text>
              </View>
            )}
          </View>
          <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {item.ubicacion || item.descripcion || 'Sin ubicación'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>
      <View className="mt-3 flex-row items-center gap-2">
        <View className="rounded-full bg-info/10 px-3 py-1">
          <Text className="text-xs font-medium text-info">
            Bs. {(item.monto ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default function BoxListScreen() {
  const router = useRouter();
  const { activeBox, loadActiveBox } = useBoxRegisterStore();
  const [search, setSearch] = useState('');
  const createModalRef = useRef<CreateBoxModalRef>(null);

  useEffect(() => {
    loadActiveBox();
  }, [loadActiveBox]);

  const {
    data: boxes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['box-register'],
    queryFn: () => boxRegisterService.getAll(1, 100),
  });

  const filtered = useMemo(() => {
    if (!boxes) return [];
    if (!search.trim()) return boxes;
    const q = search.toLowerCase();
    return boxes.filter(
      (b) => b.nombre.toLowerCase().includes(q) || (b.ubicacion || b.descripcion || '').toLowerCase().includes(q)
    );
  }, [boxes, search]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), loadActiveBox()]);
    setRefreshing(false);
  };

  return (
    <>
      <ScreenLayout className="px-4 pt-2" scrollEnabled={false}>
        <Stack.Screen
          options={{
            title: 'Cajas',
          }}
        />
        {isLoading && !boxes ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={32} color="#4DB6AC" />
          </View>
        ) : (
          <View className="w-full flex-1">
            <FlashList
              style={{ flex: 1 }}
              data={filtered}
              //   estimatedItemSize={100}
              keyExtractor={(item) => String(item.id)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListHeaderComponent={
                <View>
                  {activeBox ? (
                    <Card
                      className="mx-0 mb-4 border border-success/30  p-4"
                      onPress={() => router.push(`/box-register/${activeBox.caja_id}`)}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/20">
                            <Ionicons name="archive-outline" size={22} color="#4DB6AC" />
                          </View>
                          <View>
                            <Text className="text-xs font-medium uppercase tracking-wide text-success">
                              Mi Caja Actual
                            </Text>
                            <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                              {activeBox.caja_nombre || 'Caja activa'}
                            </Text>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#4DB6AC" />
                      </View>
                    </Card>
                  ) : null}

                  <View className="mb-3">
                    <View className="flex-row items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2.5 dark:bg-primary-dark">
                      <Ionicons name="search" size={18} color="#94a3b8" />
                      <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar Caja Registradora"
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-sm text-slate-900 dark:text-white"
                      />
                      {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                          <Ionicons name="close-circle" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">Todas las Cajas</Text>
                    <Text className="text-xs text-slate-400">{filtered.length} registros</Text>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <View className="items-center justify-center py-16">
                  <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-primary-dark">
                    <Ionicons name="archive-outline" size={32} color="#94a3b8" />
                  </View>
                  <Text className="text-base font-medium text-slate-400 dark:text-slate-500">
                    {search ? 'Sin resultados' : 'No hay cajas registradoras'}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {search ? 'Intenta con otro término' : 'Crea una nueva caja para comenzar'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => <BoxItem item={item} activeBoxId={activeBox?.caja_id} />}
            />
          </View>
        )}
        <ExpandableFAB
          icon={<Ionicons name="add" size={24} color="white" />}
          label="Nueva Caja"
          tooltipText="Crear nueva caja registradora"
          onPress={() => createModalRef.current?.present()}
          delay={3500}
        />
      </ScreenLayout>

      <CreateBoxModal ref={createModalRef} />
    </>
  );
}
