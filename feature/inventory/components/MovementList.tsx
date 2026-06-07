import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { RefreshControl, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useInventoryStore } from '@/store/inventory';
import { MovementCard } from '@/feature/inventory/components/MovementCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import productMovementService from '@/services/productMovement.service';
import type { InventoryMovement } from '@/feature/inventory/types';

const pageSize = 20;

interface MovementListProps {
  page: number;
  movimientoTipo: '' | 'entrada' | 'salida';
}

export default function MovementList({ page, movimientoTipo }: MovementListProps) {
  const router = useRouter();
  const query = useInventoryStore((state) => state.query);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const movementQuery = useQuery({
    queryKey: ['inventory', 'movements', query, movimientoTipo, page],
    queryFn: () =>
      productMovementService.getAll({ search: query, tipo: movimientoTipo, page, limit: pageSize }),
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await movementQuery.refetch();
    setRefreshing(false);
  }, [movementQuery]);

  const renderEmpty = () => (
    <View className="mx-4 mt-8 items-center justify-center rounded-3xl bg-white p-8 shadow-sm dark:bg-primary-dark">
      <Ionicons name="cube-outline" size={64} color="#CBD5E1" />
      <Text className="mt-4 text-center text-lg font-medium text-slate-600">
        No se encontraron resultados
      </Text>
      <Text className="mt-2 text-center text-sm text-slate-500">
        Prueba otra búsqueda o crea un nuevo movimiento.
      </Text>
    </View>
  );

  if (movementQuery.isLoading) {
    return (
      <View className="mt-8 px-4">
        <SkeletonLoader count={3} />
      </View>
    );
  }

  if (movementQuery.error) {
    return (
      <ErrorRetryCard
        message="No se pudo cargar los movimientos."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <>
      <FlashList
        style={{ width: '100%' }}
        data={movementQuery.data ?? []}
        renderItem={({ item }) => (
          <MovementCard
            movement={item}
            onPress={(m: InventoryMovement) => router.push(`/inventory/movimientos/${m.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} progressViewOffset={90} />
        }
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        className="bg-emerald-600">
        {snackbar.message}
      </Snackbar>
    </>
  );
}
