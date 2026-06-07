import { View, Text, Dimensions, useColorScheme } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import type { SalesByDateItem } from '@/services/analytics.service';

const screenWidth = Dimensions.get('window').width;

interface SalesChartProps {
  data: SalesByDateItem[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const isDark = useColorScheme() === 'dark';
  const labels = data.map((item) =>
    new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  );
  const values = data.map((item) => item.total);

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-cyan-200 px-2 py-1">
          <Text className="text-xs font-bold text-cyan-800">$</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800 dark:text-white">Total Ventas</Text>
      </View>

      <BarChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 72}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: isDark ? '#1E1E1E' : '#ffffff',
          backgroundGradientTo: isDark ? '#1E1E1E' : '#ffffff',
          fillShadowGradient: '#06B6D4',
          fillShadowGradientOpacity: 1,
          color: () => '#06B6D4',
          barPercentage: 0.5,
          propsForBackgroundLines: {
            strokeDasharray: '3,3',
            stroke: isDark ? '#334155' : '#E2E8F0',
          },
          propsForLabels: {
            fill: isDark ? '#475569' : '#94A3B8',
            fontSize: 10,
          },
        }}
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}
