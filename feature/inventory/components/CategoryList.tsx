import { useCallback, useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshControl, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useInventoryStore } from '@/store/inventory';
import { CategoryCard } from '@/feature/inventory/components/CategoryCard';
import FormEditCategory from '@/feature/inventory/components/FormEditCategory';
import { ConfirmModal } from '@/components/ConfirmModal';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorRetryCard from '@/components/ErrorRetryCard';
import { impactLight } from '@/helpers/haptics';
import categoryService from '@/services/category.service';
import type { CategoryItem } from '@/feature/inventory/types';

const pageSize = 20;

interface CategoryListProps {
  page: number;
}

export default function CategoryList({ page }: CategoryListProps) {
  const queryClient = useQueryClient();
  const query = useInventoryStore((state) => state.query);
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const categoryQuery = useQuery({
    queryKey: ['inventory', 'categories', query, page],
    queryFn: () => categoryService.getAll({ search: query, page, limit: pageSize }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      impactLight();
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] });
      setSnackbar({ visible: true, message: 'Categoría eliminada' });
      setDeleteCategory(null);
    },
    onError: () => {
      setSnackbar({ visible: true, message: 'No se pudo eliminar la categoría' });
    },
  });

  const handleEdit = useCallback((category: CategoryItem) => {
    setEditCategory(category);
  }, []);

  const handleDeleteCategory = useCallback((category: CategoryItem) => {
    if (category.productCount > 0) {
      Alert.alert(
        'Categoría con productos',
        `"${category.nombre}" tiene ${category.productCount} producto(s) asociado(s). Elimínalos o reasígnalos antes de borrar esta categoría.`
      );
      return;
    }
    setDeleteCategory(category);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await categoryQuery.refetch();
    setRefreshing(false);
  }, [categoryQuery]);

  const renderEmpty = () => (
    <View className="mx-4 mt-8 items-center justify-center rounded-3xl bg-white p-8 shadow-sm dark:bg-primary-dark">
      <Ionicons name="cube-outline" size={64} color="#CBD5E1" />
      <Text className="mt-4 text-center text-lg font-medium text-slate-600">
        No se encontraron resultados
      </Text>
      <Text className="mt-2 text-center text-sm text-slate-500">
        Prueba otra búsqueda o crea una nueva categoría.
      </Text>
    </View>
  );

  if (categoryQuery.isLoading) {
    return (
      <View className="mt-8 px-4">
        <SkeletonLoader count={3} />
      </View>
    );
  }

  if (categoryQuery.error) {
    return (
      <ErrorRetryCard
        message="No se pudo cargar las categorías."
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <>
      <FlashList
        style={{ width: '100%' }}
        data={categoryQuery.data ?? []}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onEdit={handleEdit}
            onDelete={handleDeleteCategory}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} progressViewOffset={90} />
        }
      />

      {editCategory && (
        <View className="absolute inset-0 z-50 bg-white">
          <FormEditCategory
            category={editCategory}
            onClose={() => setEditCategory(null)}
            onSuccess={() => categoryQuery.refetch()}
          />
        </View>
      )}

      <ConfirmModal
        visible={!!deleteCategory}
        title="Eliminar categoría"
        message={
          deleteCategory
            ? `¿Estás seguro de eliminar "${deleteCategory.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        isLoading={deleteCategoryMutation.isPending}
        onCancel={() => setDeleteCategory(null)}
        onConfirm={() => deleteCategory && deleteCategoryMutation.mutate(deleteCategory.id)}
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
