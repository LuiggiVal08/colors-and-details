export function getChartConfig(isDark: boolean) {
  const background = isDark ? '#1B1B1B' : '#FFFFFF';

  return {
    backgroundColor: background,
    backgroundGradientFrom: background,
    backgroundGradientTo: background,
    color: (opacity = 1) => (isDark ? `rgba(226, 232, 240, ${opacity})` : `rgba(30, 41, 59, ${opacity})`),
    labelColor: (opacity = 1) => (isDark ? `rgba(203, 213, 225, ${opacity})` : `rgba(100, 116, 139, ${opacity})`),
    propsForBackgroundLines: {
      strokeDasharray: '3,3',
      stroke: isDark ? '#475569' : '#E2E8F0',
    },
    propsForLabels: {
      fill: isDark ? '#CBD5E1' : '#64748B',
      fontSize: 10,
    },
  };
}
