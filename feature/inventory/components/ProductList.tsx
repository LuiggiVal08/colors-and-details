import { useCallback, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshControl, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useInventoryStore } from '@/store/inventory';
import { ProductCard } from '@/feature/inventory/components/ProductCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import { impactLight } from '@/helpers/haptics';
import productService from '@/services/product.service';
import type { ProductItem } from '@/feature/inventory/types';

const pageSize = 20;

interface ProductListProps {
  page: number;
  lowStockOnly: boolean;
}

export default function ProductList({ page, lowStockOnly }: ProductListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useInventoryStore((state) => state.query);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const productQuery = useQuery({
    queryKey: ['inventory', 'products', query, lowStockOnly, page],
    queryFn: () =>
      productService.getAll({ search: query, lowStock: lowStockOnly, page, limit: pageSize }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      setSnackbar({ visible: true, message: 'Producto eliminado' });
      setDeleteProduct(null);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'No se pudo eliminar el producto' });
    },
  });

  const handleItemPress = useCallback(
    (id: string) => {
      router.push(`/inventory/productos/${id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await productQuery.refetch();
    setRefreshing(false);
  }, [productQuery]);

  const renderEmpty = () => (
    <View className="mx-4 mt-8 items-center justify-center rounded-3xl bg-white p-8 shadow-sm dark:bg-primary-dark">
      <Ionicons name="cube-outline" size={64} color="#CBD5E1" />
      <Text className="mt-4 text-center text-lg font-medium text-slate-600">
        No se encontraron resultados
      </Text>
      <Text className="mt-2 text-center text-sm text-slate-500">
        Prueba otra búsqueda o crea un nuevo producto.
      </Text>
    </View>
  );

  if (productQuery.isLoading) {
    return (
      <View className="mt-8 px-4">
        <SkeletonLoader count={3} />
      </View>
    );
  }

  if (productQuery.error) {
    return (
      <ErrorRetryCard
        message="No se pudo cargar los productos."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <>
      <FlashList
        style={{ width: '100%' }}
        data={productQuery.data ?? []}
        renderItem={({ item }) => (
          <View key={item.id} className="relative">
            <ProductCard product={item} onPress={() => handleItemPress(item.id)} />
            <TouchableOpacity
              onPress={() => setDeleteProduct(item)}
              className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-rose-50">
              <Ionicons name="trash-outline" size={16} color="#E11D48" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} progressViewOffset={90} />
        }
      />

      <ConfirmModal
        visible={!!deleteProduct}
        title="Eliminar producto"
        message={
          deleteProduct
            ? `¿Estás seguro de eliminar "${deleteProduct.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        isLoading={deleteProductMutation.isPending}
        onCancel={() => setDeleteProduct(null)}
        onConfirm={() => deleteProduct && deleteProductMutation.mutate(deleteProduct.id)}
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
