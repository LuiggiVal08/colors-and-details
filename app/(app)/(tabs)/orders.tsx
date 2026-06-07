import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import ScreenLayout from '@/components/layout/ScreenLayout';
import MiniHeader from '@/components/MiniHeader';
import OrderCard from '@/feature/order/components/OrderCard';
import orderService from '@/services/order.service';
import type { OrderStatus } from '@/types/order';
import ExpandableFAB from '@/components/ExpandableFAB';
import { impactLight, selection } from '@/helpers/haptics';
type FilterKey = OrderStatus | 'todos';

const FILTER_OPTIONS: {
  key: FilterKey;
  label: string;
  icon: 'layers-outline' | 'time-outline' | 'sync-outline' | 'checkmark-circle-outline' | 'close-circle-outline';
}[] = [
  { key: 'todos', label: 'Todos', icon: 'layers-outline' },
  { key: 'pendiente', label: 'Pendiente', icon: 'time-outline' },
  { key: 'procesado', label: 'En Proceso', icon: 'sync-outline' },
  { key: 'completado', label: 'Completado', icon: 'checkmark-circle-outline' },
  { key: 'cancelado', label: 'Cancelado', icon: 'close-circle-outline' },
];

const LABEL_MAP: Record<FilterKey, string> = {
  todos: 'Todos',
  pendiente: 'Pendientes',
  procesado: 'En Proceso',
  completado: 'Completados',
  cancelado: 'Cancelados',
};

export default function OrdersScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('pendiente');
  const [search, setSearch] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAll({}),
  });

  const filtered = useMemo(() => {
    if (!orders) return [];
    let result =
      filter === 'todos' ? orders.filter((o) => o.estado !== 'cancelado') : orders.filter((o) => o.estado === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) => String(o.id).includes(q) || (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, filter, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pedidos',
        }}
      />
      <ScreenLayout scrollEnabled={false} className="px-4 pt-2">
        <View className="w-full flex-1">
          <MiniHeader />
          <View className="mb-3 flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:bg-primary-dark dark:border-slate-700">
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por ID o cliente..."
                placeholderTextColor="#94A3B8"
                className="flex-1 text-sm text-slate-900"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                impactLight();
                setShowFilterModal(true);
              }}
              className="flex-row items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm dark:bg-primary-dark dark:border-slate-700">
              <Ionicons name="funnel-outline" size={16} color="#64748B" />
              <Text className="text-sm font-medium text-slate-700">{LABEL_MAP[filter]}</Text>
            </TouchableOpacity>
          </View>

          {isLoading && !orders ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size={32} color="#4DB6AC" />
            </View>
          ) : (
            <FlashList
              key="orders"
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View className="items-center py-16">
                  <Ionicons name="document-text-outline" size={56} color="#CBD5E1" />
                  <Text className="mt-3 text-base text-slate-400">
                    {search.trim() ? 'Sin resultados' : `No hay ${LABEL_MAP[filter].toLowerCase()}`}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-400">
                    {search.trim() ? 'Prueba con otro término' : 'Crea uno con el botón +'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => <OrderCard order={item} onPress={() => router.push(`/order/${item.id}`)} />}
            />
          )}
        </View>

        <ExpandableFAB
          icon={<Ionicons name="add" size={24} color="white" />}
          label="Nuevo Pedido"
          tooltipText="Crear nuevo pedido"
          onPress={() => router.push('/order/new')}
          delay={3500}
        />
      </ScreenLayout>

      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
          className="flex-1 items-center justify-center bg-black/40 px-6">
          <TouchableOpacity activeOpacity={1} className="w-full max-w-xs rounded-3xl bg-white p-5 dark:bg-primary-dark">
            <Text className="mb-4 text-lg font-bold text-slate-900">Filtrar por estado</Text>
            <View className="gap-1.5">
              {FILTER_OPTIONS.map((opt) => {
                const active = filter === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => {
                      selection();
                      setFilter(opt.key);
                      setShowFilterModal(false);
                    }}
                    className={`flex-row items-center gap-3 rounded-2xl p-3.5 ${active ? 'border border-[#4DB6AC] bg-[#4DB6AC]/10' : 'border border-slate-200'}`}>
                    <View
                      className={`h-8 w-8 items-center justify-center rounded-full ${active ? 'bg-[#4DB6AC]' : 'bg-slate-50'}`}>
                      <Ionicons name={opt.icon} size={16} color={active ? '#fff' : '#64748B'} />
                    </View>
                    <Text className={`flex-1 text-sm font-medium ${active ? 'text-[#4DB6AC]' : 'text-slate-900'}`}>
                      {opt.label}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color="#4DB6AC" />}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              className="mt-4 items-center rounded-2xl border border-slate-200 py-3 dark:border-slate-700">
              <Text className="font-medium text-slate-600">Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
