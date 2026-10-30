import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { useAnalytics } from '@/hooks/useAnalytics';
import SalesChart from '@/components/charts/SalesChart';
import OrdersChart from '@/components/charts/OrdersChart';
import StockCategoryChart from '@/components/charts/StockCategoryChart';
import LowStockChart from '@/components/charts/LowStockChart';
import SkeletonLoader from '@/components/SkeletonLoader';

function KPICard({
  label,
  value,
  bgClass,
  labelClass,
  textClass,
  currencyPrefix,
}: {
  label: string;
  value: string | number;
  bgClass: string;
  labelClass: string;
  textClass: string;
  currencyPrefix?: string;
}) {
  return (
    <View className={`flex-1 rounded-2xl p-4 ${bgClass}`}>
      <Text className={`text-sm font-semibold opacity-80 ${labelClass}`}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        numberOfLines={1}
        className={`text-2xl font-bold ${textClass}`}>
        {currencyPrefix}
        {typeof value === 'number'
          ? value.toLocaleString('es-VE', {
              minimumFractionDigits: currencyPrefix ? 2 : 0,
              maximumFractionDigits: 2,
            })
          : value}
      </Text>
    </View>
  );
}

function SkeletonKPICard() {
  return (
    <View className="flex-1 animate-pulse rounded-2xl bg-slate-200 p-4 dark:bg-slate-800">
      <View className="mb-2 h-4 w-20 rounded bg-slate-300 dark:bg-slate-700" />
      <View className="h-8 w-28 rounded bg-slate-300 dark:bg-slate-700" />
    </View>
  );
}

function DashboardQueryState({
  message,
  onRetry,
  isRetrying = false,
}: {
  message: string;
  onRetry?: () => Promise<unknown>;
  isRetrying?: boolean;
}) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View className="mb-4 items-center rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950">
      <Text className="text-center text-sm text-rose-800 dark:text-rose-200">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isRetrying}
          onPress={() => {
            void onRetry();
          }}
          className="mt-3 min-h-11 items-center justify-center rounded-xl bg-rose-700 px-5 dark:bg-rose-200">
          <Text className={`text-sm font-semibold ${isDark ? 'text-rose-950' : 'text-white'}`}>
            {isRetrying ? 'Cargando…' : 'Reintentar'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DashboardEmptyState({ message }: { message: string }) {
  return (
    <View className="mb-4 items-center rounded-2xl border border-slate-100 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800">
      <Text className="text-center text-slate-600 dark:text-slate-300">{message}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const isDark = useColorScheme() === 'dark';
  const {
    kpis,
    kpisLoading,
    kpisError,
    kpisFetching,
    retryKpis,
    sales,
    salesLoading,
    salesError,
    salesFetching,
    retrySales,
    orders,
    ordersLoading,
    ordersError,
    ordersFetching,
    retryOrders,
    stock,
    stockLoading,
    stockError,
    stockFetching,
    retryStock,
    lowStock,
    lowStockLoading,
    lowStockError,
    lowStockFetching,
    retryLowStock,
  } = useAnalytics();

  return (
    <ScreenLayout>
      <ScrollView className="w-full px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-6 w-full max-w-3xl self-center">
          <Text className={`mb-1 text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Resumen del negocio
          </Text>
          <Text className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Ventas y pedidos: últimos 12 meses. Clientes y productos: total actual.
          </Text>

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
          ) : kpisError && !kpis ? (
            <DashboardQueryState
              message="No pudimos cargar el resumen del periodo. Inténtalo de nuevo."
              onRetry={retryKpis}
              isRetrying={kpisFetching}
            />
          ) : kpis ? (
            <>
              <View className="mb-6">
                <View className="mb-3 flex-row gap-3">
                  <KPICard
                    label="Ventas (USD)"
                    value={kpis.totalSales}
                    currencyPrefix="$"
                    bgClass="bg-blue-100 dark:bg-blue-950"
                    labelClass="text-blue-800 dark:text-blue-300"
                    textClass="text-blue-800 dark:text-blue-200"
                  />
                  <KPICard
                    label="Pedidos"
                    value={kpis.totalOrders}
                    bgClass="bg-yellow-100 dark:bg-yellow-950"
                    labelClass="text-yellow-800 dark:text-yellow-300"
                    textClass="text-yellow-800 dark:text-yellow-200"
                  />
                </View>
                <View className="flex-row gap-3">
                  <KPICard
                    label="Clientes"
                    value={kpis.totalClients}
                    bgClass="bg-green-100 dark:bg-green-950"
                    labelClass="text-green-800 dark:text-green-300"
                    textClass="text-green-800 dark:text-green-200"
                  />
                  <KPICard
                    label="Productos"
                    value={kpis.totalProducts}
                    bgClass="bg-purple-100 dark:bg-purple-950"
                    labelClass="text-purple-800 dark:text-purple-300"
                    textClass="text-purple-800 dark:text-purple-200"
                  />
                </View>
              </View>
              {kpisError && (
                <DashboardQueryState
                  message="No se pudo actualizar el resumen. Se muestran los últimos datos disponibles."
                  onRetry={retryKpis}
                  isRetrying={kpisFetching}
                />
              )}
            </>
          ) : null}

          {salesLoading ? (
            <SkeletonLoader count={1} variant="card" height={220} />
          ) : salesError && (!sales || sales.length === 0) ? (
            <DashboardQueryState
              message="No pudimos cargar las ventas. Inténtalo de nuevo."
              onRetry={retrySales}
              isRetrying={salesFetching}
            />
          ) : sales && sales.length > 0 ? (
            <>
              <SalesChart data={sales} />
              {salesError && (
                <DashboardQueryState
                  message="No se pudieron actualizar las ventas. Se muestran los últimos datos disponibles."
                  onRetry={retrySales}
                  isRetrying={salesFetching}
                />
              )}
            </>
          ) : (
            <DashboardEmptyState message="No hay ventas en los últimos 12 meses." />
          )}

          {ordersLoading ? (
            <SkeletonLoader count={1} variant="card" height={220} />
          ) : ordersError && (!orders || orders.length === 0) ? (
            <DashboardQueryState
              message="No pudimos cargar los pedidos. Inténtalo de nuevo."
              onRetry={retryOrders}
              isRetrying={ordersFetching}
            />
          ) : orders && orders.length > 0 ? (
            <>
              <OrdersChart data={orders} />
              {ordersError && (
                <DashboardQueryState
                  message="No se pudieron actualizar los pedidos. Se muestran los últimos datos disponibles."
                  onRetry={retryOrders}
                  isRetrying={ordersFetching}
                />
              )}
            </>
          ) : (
            <DashboardEmptyState message="No hay pedidos en los últimos 12 meses." />
          )}

          {stockLoading ? (
            <SkeletonLoader count={1} variant="card" height={280} />
          ) : stockError && (!stock || stock.length === 0) ? (
            <DashboardQueryState
              message="No pudimos cargar el inventario por categoría. Inténtalo de nuevo."
              onRetry={retryStock}
              isRetrying={stockFetching}
            />
          ) : stock && stock.length > 0 ? (
            <>
              <StockCategoryChart data={stock} />
              {stockError && (
                <DashboardQueryState
                  message="No se pudo actualizar el inventario. Se muestran los últimos datos disponibles."
                  onRetry={retryStock}
                  isRetrying={stockFetching}
                />
              )}
            </>
          ) : (
            <DashboardEmptyState message="No hay datos de inventario por categoría." />
          )}

          {lowStockLoading ? (
            <SkeletonLoader count={1} variant="card" height={220} />
          ) : lowStockError && (!lowStock || lowStock.length === 0) ? (
            <DashboardQueryState
              message="No pudimos cargar los productos con stock bajo. Inténtalo de nuevo."
              onRetry={retryLowStock}
              isRetrying={lowStockFetching}
            />
          ) : lowStock && lowStock.length > 0 ? (
            <>
              <LowStockChart data={lowStock} />
              {lowStockError && (
                <DashboardQueryState
                  message="No se pudo actualizar el stock bajo. Se muestran los últimos datos disponibles."
                  onRetry={retryLowStock}
                  isRetrying={lowStockFetching}
                />
              )}
            </>
          ) : (
            <DashboardEmptyState message="No hay productos con stock bajo." />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
