import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ExpandableFAB from '@/components/ExpandableFAB';
import { useInventoryStore } from '@/store/inventory';
import { InventoryTabs } from '@/feature/inventory/components/InventoryTabs';
import { InventorySearchBar } from '@/feature/inventory/components/InventorySearchBar';
import CategoryList from '@/feature/inventory/components/CategoryList';
import ProductList from '@/feature/inventory/components/ProductList';
import MovementList from '@/feature/inventory/components/MovementList';
import type { InventoryTabKey } from '@/feature/inventory/types';

const tabLabels: Record<InventoryTabKey, string> = {
  categorias: 'Categorías',
  productos: 'Productos',
  movimientos: 'Movimientos',
};

export default function AdminInventoryScreen() {
  const router = useRouter();

  const selectedTab = useInventoryStore((state) => state.selectedTab);
  const query = useInventoryStore((state) => state.query);
  const setSelectedTab = useInventoryStore((state) => state.setSelectedTab);
  const setQuery = useInventoryStore((state) => state.setQuery);

  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [movimientoTipo, setMovimientoTipo] = useState<'' | 'entrada' | 'salida'>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedTab, query, lowStockOnly, movimientoTipo]);

  const handleTabChange = (value: InventoryTabKey) => {
    setSelectedTab(value);
    setQuery('');
    setLowStockOnly(false);
    setMovimientoTipo('');
  };

  const handleCreate = () => {
    router.push(`/inventory/${valueToRoute(selectedTab)}/create`);
  };

  const fabLabel =
    selectedTab === 'categorias'
      ? 'Nueva Categoría'
      : selectedTab === 'productos'
        ? 'Nuevo Producto'
        : 'Nuevo Movimiento';

  const fabTooltip =
    selectedTab === 'categorias'
      ? 'Crear nueva categoría'
      : selectedTab === 'productos'
        ? 'Crear nuevo producto'
        : 'Crear nuevo movimiento';

  return (
    <ScreenLayout scrollEnabled={false}>
      <Stack.Screen options={{ title: 'Inventario' }} />
      <View className="relative mt-4 w-full max-w-5xl flex-1">
        <View pointerEvents="box-none">
          <View className="mx-4 rounded-3xl bg-white p-4 shadow-sm dark:bg-primary-dark">
            <InventoryTabs value={selectedTab} onValueChange={handleTabChange} />
            <View className="mt-4">
              <InventorySearchBar
                value={query}
                onChangeText={setQuery}
                tab={selectedTab}
                lowStock={lowStockOnly}
                onLowStockToggle={() => setLowStockOnly((current) => !current)}
                movimientoTipo={movimientoTipo}
                onMovimientoTipoChange={setMovimientoTipo}
              />
            </View>
          </View>
          <View className="mx-4 mb-4">
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-semibold text-slate-900">{tabLabels[selectedTab]}</Text>
              <Text className="text-sm text-slate-500">
                Lista actualizada de {tabLabels[selectedTab].toLowerCase()}.
              </Text>
            </View>
          </View>
        </View>

        {selectedTab === 'categorias' && <CategoryList page={page} />}
        {selectedTab === 'productos' && (
          <ProductList page={page} lowStockOnly={lowStockOnly} />
        )}
        {selectedTab === 'movimientos' && (
          <MovementList page={page} movimientoTipo={movimientoTipo} />
        )}
      </View>

      <ExpandableFAB
        icon={<Ionicons name="add" size={24} color="white" />}
        label={fabLabel}
        tooltipText={fabTooltip}
        onPress={handleCreate}
        delay={3500}
      />
    </ScreenLayout>
  );
}

function valueToRoute(value: InventoryTabKey) {
  if (value === 'categorias') return 'categorias';
  if (value === 'productos') return 'productos';
  return 'movimientos';
}
