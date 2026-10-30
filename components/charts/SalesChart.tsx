import { useState } from 'react';
import { View, Text, LayoutChangeEvent, useColorScheme } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import type { SalesByDateItem } from '@/services/analytics.service';
import { getChartConfig } from '@/components/charts/chartConfig';

interface SalesChartProps {
  data: SalesByDateItem[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const isDark = useColorScheme() === 'dark';
  const [width, setWidth] = useState(0);
  const labels = data.map((item) =>
    new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  );
  const values = data.map((item) => item.total);

  return (
    <View
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-cyan-200 px-2 py-1 dark:bg-cyan-950">
          <Text className="text-xs font-bold text-cyan-800 dark:text-cyan-200">USD</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">Ventas totales</Text>
      </View>

      {width > 0 && (
        <BarChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={width - 32}
          height={220}
          yAxisLabel="$ "
          yAxisSuffix=""
          chartConfig={{
            ...getChartConfig(isDark),
            fillShadowGradient: '#4DB6AC',
            fillShadowGradientOpacity: 1,
            color: (opacity = 1) => `rgba(77, 182, 172, ${opacity})`,
            barPercentage: 0.5,
          }}
          style={{ borderRadius: 12 }}
        />
      )}
    </View>
  );
}
