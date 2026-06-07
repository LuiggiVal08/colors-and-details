import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { useAnalytics } from '@/hooks/useAnalytics';
import SalesChart from '@/components/charts/SalesChart';
import OrdersChart from '@/components/charts/OrdersChart';
import StockCategoryChart from '@/components/charts/StockCategoryChart';
import LowStockChart from '@/components/charts/LowStockChart';
import SkeletonLoader from '@/components/SkeletonLoader';
import Card from '@/components/Card';

function KPICard({ label, value, bgClass, textClass }: { label: string; value: string | number; bgClass: string; textClass: string }) {
  return (
    <View className={`flex-1 rounded-2xl p-4 ${bgClass}`}>
      <Text className="text-sm font-semibold opacity-80">{label}</Text>
      <Text className={`text-2xl font-bold ${textClass}`}>
        {typeof value === 'number' && label.includes('Ventas')
          ? `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
          : value.toLocaleString('es-ES')}
      </Text>
    </View>
  );
}

function SkeletonKPICard() {
  return (
    <View className="flex-1 animate-pulse rounded-2xl bg-slate-200 p-4">
      <View className="mb-2 h-4 w-20 rounded bg-slate-300" />
      <View className="h-8 w-28 rounded bg-slate-300" />
    </View>
  );
}

export default function DashboardScreen() {
  const {
    kpis,
    kpisLoading,
    sales,
    salesLoading,
    orders,
    ordersLoading,
    stock,
    stockLoading,
    lowStock,
    lowStockLoading,
  } = useAnalytics();

  return (
    <ScreenLayout>
      <ScrollView className="w-full px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Card className="mb-6 w-full max-w-3xl">
          <Text className="mb-1 text-3xl font-bold text-slate-900">Dashboard</Text>
          <Text className="mb-6 text-slate-500">Resumen de analíticas y métricas clave.</Text>

          {kpisLoading ? (
            <View className="mb-6">
              <View className="mb-3 flex-row gap-3">
                <SkeletonKPICard />
                <SkeletonKPICard />
              </View>
              <View className="flex-row gap-3">
                <SkeletonKPICard />
                <SkeletonKPICard />
              </View>
            </View>
          ) : (
            kpis && (
              <View className="mb-6">
                <View className="mb-3 flex-row gap-3">
                  <KPICard
                    label="Ventas Totales"
                    value={kpis.totalSales}
                    bgClass="bg-blue-100"
                    textClass="text-blue-700"
                  />
                  <View className="w-3" />
                  <KPICard
                    label="Pedidos"
                    value={kpis.totalOrders}
                    bgClass="bg-yellow-100"
                    textClass="text-yellow-700"
                  />
                </View>
                <View className="flex-row gap-3">
                  <KPICard
                    label="Clientes"
                    value={kpis.totalClients}
                    bgClass="bg-green-100"
                    textClass="text-green-700"
                  />
                  <View className="w-3" />
                  <KPICard
                    label="Productos"
                    value={kpis.totalProducts}
                    bgClass="bg-purple-100"
                    textClass="text-purple-700"
                  />
                </View>
              </View>
            )
          )}

          {salesLoading ? (
            <SkeletonLoader count={1} variant="card" height={220} />
          ) : sales && sales.length > 0 ? (
            <SalesChart data={sales} />
          ) : (
            <Card className="mb-4 rounded-2xl p-8">
              <Text className="text-center text-slate-400">No hay datos de ventas disponibles</Text>
            </Card>
          )}

          {ordersLoading ? (
            <SkeletonLoader count={1} variant="card" height={220} />
          ) : orders && orders.length > 0 ? (
            <OrdersChart data={orders} />
          ) : (
            <Card className="mb-4 rounded-2xl p-8">
              <Text className="text-center text-slate-400">No hay datos de pedidos disponibles</Text>
            </Card>
          )}

          {stockLoading ? (
            <SkeletonLoader count={1} variant="card" height={280} />
          ) : stock && stock.length > 0 ? (
            <StockCategoryChart data={stock} />
          ) : (
            <Card className="mb-4 rounded-2xl p-8">
              <Text className="text-center text-slate-400">No hay datos de stock por categoría</Text>
            </Card>
          )}

          {lowStockLoading ? (
            <SkeletonLoader count={1} variant="card" height={220} />
          ) : lowStock && lowStock.length > 0 ? (
            <LowStockChart data={lowStock} />
          ) : (
            <Card className="mb-4 rounded-2xl p-8">
              <Text className="text-center text-slate-400">No hay productos con stock bajo</Text>
            </Card>
          )}
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
}
