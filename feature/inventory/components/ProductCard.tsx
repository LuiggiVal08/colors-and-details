import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductItem } from '@/feature/inventory/types';
import { impactLight } from '@/helpers/haptics';
import { useExchangeRateStore } from '@/store/exchangeRate';
import Card from '@/components/Card';

interface ProductCardProps {
  product: ProductItem;
  onPress: () => void;
}

const fmt = (n: number) => n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ProductCard = ({ product, onPress }: ProductCardProps) => {
  const tasa = useExchangeRateStore((state) => state.tasa);
  const handlePress = () => {
    impactLight();
    onPress();
  };

  const isLowStock = product.stock < 5;
  const isAgotado = product.stock <= 0;
  const precioBs = tasa ? product.precio * tasa : 0;

  return (
    <Card className="mx-4 mb-3" onPress={handlePress}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <View className="mb-2 flex-row items-center gap-2">
            <View className="rounded-2xl bg-slate-100 px-3 py-1 dark:bg-slate-800">
              <Text className="text-xs uppercase tracking-[0.2px] text-slate-500 dark:text-slate-400">
                {product.codigo}
              </Text>
            </View>
            <Text className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{product.nombre}</Text>
          </View>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Categoría: {product.categoria}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#475569" />
      </View>

      <View className="mt-4 flex-row flex-wrap items-center justify-between gap-3">
        <View>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Precio</Text>
          <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">${fmt(product.precio)}</Text>
          {tasa && (
            <Text className="text-xs text-slate-500 dark:text-slate-400">Bs. {fmt(precioBs)}</Text>
          )}
        </View>
        <View>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Stock</Text>
          <Text
            className={`text-base font-semibold ${
              isAgotado
                ? 'text-rose-600 dark:text-rose-400'
                : isLowStock
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-slate-100'
            }`}>
            {product.stock}
          </Text>
        </View>
        <View
          className={`rounded-full px-3 py-1 ${
            isAgotado
              ? 'bg-rose-100 dark:bg-rose-500/20'
              : isLowStock
                ? 'bg-amber-100 dark:bg-amber-500/20'
                : 'bg-emerald-100 dark:bg-emerald-500/20'
          }`}>
          <Text
            className={`text-xs font-semibold ${
              isAgotado
                ? 'text-rose-600 dark:text-rose-400'
                : isLowStock
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
            }`}>
            {isAgotado ? 'Agotado' : isLowStock ? 'Stock bajo' : 'En stock'}
          </Text>
        </View>
      </View>
    </Card>
  );
};
