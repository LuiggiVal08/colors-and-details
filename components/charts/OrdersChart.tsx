import { useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { OrdersByMonthItem } from '@/services/analytics.service';

interface OrdersChartProps {
  data: OrdersByMonthItem[];
}
// 80,132
// 610,370
export default function OrdersChart({ data }: OrdersChartProps) {
  const [width, setWidth] = useState(0);

  const labels = data.map((item) => item.month);
  const values = data.map((item) => item.quantity);

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-purple-200 px-2 py-1">
          <Text className="text-xs font-bold text-purple-800">#</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800">Número de Pedidos</Text>
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
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: () => '#8B5CF6',
            strokeWidth: 3,
            propsForBackgroundLines: {
              strokeDasharray: '3,3',
              stroke: '#E2E8F0',
            },
            propsForLabels: {
              fill: '#94A3B8',
              fontSize: 10,
            },
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
