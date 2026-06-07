import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import shoppingService from '@/services/shopping.service';
import Card from '@/components/Card';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function SaleHistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: sales, isLoading } = useQuery({
    queryKey: ['shopping', 'list'],
    queryFn: () => shoppingService.getAll(1, 50),
  });

  const filtered = useMemo(() => {
    if (!sales) return [];
    if (!search) return sales;
    const q = search.toLowerCase();
    return sales.filter((s) => s.cliente_nombre?.toLowerCase().includes(q));
  }, [sales, search]);

  return (
    <>
      <Stack.Screen options={{ title: 'Historial de Ventas' }} />
      <ScreenLayout scrollEnabled={false}>
        <View className="flex-1 w-full px-4 pt-2">
          <View className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 dark:bg-primary-dark dark:border-slate-700">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por cliente..."
              className="ml-3 flex-1 text-base text-slate-900"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {isLoading ? (
            <SkeletonLoader count={5} variant="card" />
          ) : (
            <FlashList
              data={filtered}
              estimatedItemSize={100}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Card className="mb-3" onPress={() => router.push(`/shopping/${item.id}`)}>
                  <View className="flex-row items-center justify-between">
                    <View className="min-w-0 flex-1">
                      <View className="flex-row items-center gap-2">
                        <View className="h-2 w-2 rounded-full bg-emerald-500" />
                        <Text className="font-semibold text-slate-900">{item.cliente_nombre || 'Cliente Genérico'}</Text>
                      </View>
                      <Text className="text-sm text-slate-500">
                        {new Date(item.fecha).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text className="text-lg font-bold text-slate-900">
                      Bs. {(item.total as number)?.toLocaleString('es-VE') || '0'}
                    </Text>
                  </View>
                </Card>
              )}
              ListEmptyComponent={
                <View className="py-12">
                  <Text className="text-center text-slate-500">No hay ventas registradas</Text>
                </View>
              }
            />
          )}
        </View>
      </ScreenLayout>
    </>
  );
}
