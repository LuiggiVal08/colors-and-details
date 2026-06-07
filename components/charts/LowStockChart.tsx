import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import type { LowStockItem } from '@/services/analytics.service';

const screenWidth = Dimensions.get('window').width;

interface LowStockChartProps {
  data: LowStockItem[];
}

export default function LowStockChart({ data }: LowStockChartProps) {
  const labels = data.map((item) =>
    item.product.length > 10 ? `${item.product.slice(0, 8)}..` : item.product
  );
  const values = data.map((item) => item.stock);

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-rose-200 px-2 py-1">
          <Text className="text-xs font-bold text-rose-800">!</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800">Stock Bajo</Text>
      </View>

      <BarChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 72}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          fillShadowGradient: '#F43F5E',
          fillShadowGradientOpacity: 1,
          color: () => '#F43F5E',
          barPercentage: 0.5,
          propsForBackgroundLines: {
            strokeDasharray: '3,3',
            stroke: '#E2E8F0',
          },
          propsForLabels: {
            fill: '#94A3B8',
            fontSize: 9,
          },
        }}
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
