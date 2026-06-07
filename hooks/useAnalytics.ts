import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

const getDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  return startDate;
};

export const useAnalytics = () => {
  const startDate = getDateRange();

  const kpisQuery = useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: analyticsService.getKPIs,
    staleTime: 1000 * 60 * 5,
  });

  const salesQuery = useQuery({
    queryKey: ['analytics-sales'],
    queryFn: () => analyticsService.getSalesByDate(startDate),
    staleTime: 1000 * 60 * 5,
  });

  const ordersQuery = useQuery({
    queryKey: ['analytics-orders'],
    queryFn: () => analyticsService.getOrdersByMonth(startDate),
    staleTime: 1000 * 60 * 5,
  });

  const stockQuery = useQuery({
    queryKey: ['analytics-stock'],
    queryFn: analyticsService.getStockByCategory,
    staleTime: 1000 * 60 * 15,
  });

  const lowStockQuery = useQuery({
    queryKey: ['analytics-low-stock'],
    queryFn: analyticsService.getLowStock,
    staleTime: 1000 * 60 * 5,
  });

  return {
    kpis: kpisQuery.data,
    kpisLoading: kpisQuery.isLoading,
    kpisError: kpisQuery.error,

    sales: salesQuery.data,
    salesLoading: salesQuery.isLoading,
    salesError: salesQuery.error,

    orders: ordersQuery.data,
    ordersLoading: ordersQuery.isLoading,
    ordersError: ordersQuery.error,

    stock: stockQuery.data,
    stockLoading: stockQuery.isLoading,
    stockError: stockQuery.error,

    lowStock: lowStockQuery.data,
    lowStockLoading: lowStockQuery.isLoading,
    lowStockError: lowStockQuery.error,

    refetch: () => {
      kpisQuery.refetch();
      salesQuery.refetch();
      ordersQuery.refetch();
      stockQuery.refetch();
      lowStockQuery.refetch();
    },
  };
};
