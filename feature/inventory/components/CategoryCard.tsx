import { View, Text, TouchableOpacity } from 'react-native';
import type { CategoryItem } from '@/feature/inventory/types';
import { Ionicons } from '@expo/vector-icons';
import { impactLight } from '@/helpers/haptics';
import Card from '@/components/Card';

interface CategoryCardProps {
  category: CategoryItem;
  onEdit: (category: CategoryItem) => void;
  onDelete?: (category: CategoryItem) => void;
}

export const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
  const handleEdit = () => {
    impactLight();
    onEdit(category);
  };
  const handleDelete = () => {
    impactLight();
    onDelete?.(category);
  };
  return (
    <Card className="mx-4 mb-2 rounded-2xl p-4">
      <View className="flex-row items-center justify-between gap-3">
        <TouchableOpacity onPress={handleEdit} className="min-w-0 flex-1" activeOpacity={0.7}>
          <Text className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{category.nombre}</Text>
          <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {category.descripcion || 'Sin descripción'}
          </Text>
        </TouchableOpacity>
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={handleEdit}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
            activeOpacity={0.7}>
            <Ionicons name="pencil" size={16} color="#475569" />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              className="h-9 w-9 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/20"
              activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color="#E11D48" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
};
