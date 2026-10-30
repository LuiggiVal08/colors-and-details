import { useState } from 'react';
import { View, Text, LayoutChangeEvent, useColorScheme } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import type { LowStockItem } from '@/services/analytics.service';
import { getChartConfig } from '@/components/charts/chartConfig';

interface LowStockChartProps {
  data: LowStockItem[];
}

export default function LowStockChart({ data }: LowStockChartProps) {
  const isDark = useColorScheme() === 'dark';
  const [width, setWidth] = useState(0);
  const labels = data.map((item) => (item.product.length > 10 ? `${item.product.slice(0, 8)}..` : item.product));
  const values = data.map((item) => item.stock);

  return (
    <View
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-rose-200 px-2 py-1 dark:bg-rose-950">
          <Text className="text-xs font-bold text-rose-800 dark:text-rose-200">!</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">Stock bajo</Text>
      </View>

      {width > 0 && (
        <BarChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={width - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            ...getChartConfig(isDark),
            fillShadowGradient: '#F43F5E',
            fillShadowGradientOpacity: 1,
            color: (opacity = 1) => `rgba(244, 63, 94, ${opacity})`,
            barPercentage: 0.5,
          }}
          style={{ borderRadius: 12 }}
        />
      )}

      <View className="mt-2 gap-2">
        {data.map((item, index) => (
          <View
            key={`${item.product}-${index}`}
            className="flex-row items-start justify-between gap-3 border-t border-slate-100 pt-2 dark:border-slate-700">
            <Text className="flex-1 text-xs text-slate-600 dark:text-slate-300">{item.product}</Text>
            <Text className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {item.stock.toLocaleString('es-VE')} uds.
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
