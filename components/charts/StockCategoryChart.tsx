import { View, Text, Dimensions, useColorScheme } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import type { StockByCategoryItem } from '@/services/analytics.service';

const screenWidth = Dimensions.get('window').width;

interface StockCategoryChartProps {
  data: StockByCategoryItem[];
}

export default function StockCategoryChart({ data }: StockCategoryChartProps) {
  const isDark = useColorScheme() === 'dark';
  const chartData = data.map((item) => ({
    name: item.category,
    population: item.totalItems,
    color: item.color,
    legendFontColor: isDark ? '#CBD5E1' : '#94A3B8',
    legendFontSize: 12,
  }));

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 dark:bg-primary-dark">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-md bg-emerald-200 px-2 py-1">
          <Text className="text-xs font-bold text-emerald-800">%</Text>
        </View>
        <Text className="text-base font-semibold text-slate-800 dark:text-white">Stock por Categoría</Text>
      </View>

      <PieChart
        data={chartData}
        width={screenWidth - 72}
        height={220}
        chartConfig={{
          color: () => (isDark ? '#E2E8F0' : '#1E293B'),
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
      />

      <View className="mt-3 flex-row flex-wrap gap-2">
        {data.map((item) => (
          <View key={item.category} className="flex-row items-center gap-1">
            <View style={{ backgroundColor: item.color }} className="h-3 w-3 rounded-full" />
            <Text className="text-xs text-slate-600 dark:text-slate-400">{item.category}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
