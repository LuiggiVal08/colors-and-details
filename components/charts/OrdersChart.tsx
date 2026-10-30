import { useState } from 'react';
import { View, Text, LayoutChangeEvent, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { OrdersByMonthItem } from '@/services/analytics.service';
import { getChartConfig } from '@/components/charts/chartConfig';

interface OrdersChartProps {
  data: OrdersByMonthItem[];
}

export default function OrdersChart({ data }: OrdersChartProps) {
  const isDark = useColorScheme() === 'dark';
  const [width, setWidth] = useState(0);

  const labels = data.map((item) => item.month);
  const values = data.map((item) => item.quantity);

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-purple-200 px-2 py-1 dark:bg-purple-950">
          <Text className="text-xs font-bold text-purple-800 dark:text-purple-200">#</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">Pedidos por mes</Text>
      </View>

      {width > 0 && (
        <LineChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={width - 32}
          height={220}
          yAxisSuffix=""
          chartConfig={{
            ...getChartConfig(isDark),
            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
            strokeWidth: 3,
            propsForDots: {
              fill: '#8B5CF6',
              r: '4',
            },
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      )}
    </View>
  );
}
