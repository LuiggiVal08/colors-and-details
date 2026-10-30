import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

const getDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  return {
    startDate,
    dateKey: startDate.toISOString().slice(0, 10),
  };
};

export const useAnalytics = () => {
  const { startDate, dateKey } = useMemo(() => getDateRange(), []);

  const kpisQuery = useQuery({
    queryKey: ['analytics-kpis', dateKey],
    queryFn: () => analyticsService.getKPIs(startDate),
    staleTime: 1000 * 60 * 5,
  });

  const salesQuery = useQuery({
    queryKey: ['analytics-sales', dateKey],
    queryFn: () => analyticsService.getSalesByDate(startDate),
    staleTime: 1000 * 60 * 5,
  });

  const ordersQuery = useQuery({
    queryKey: ['analytics-orders', dateKey],
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
    kpisFetching: kpisQuery.isFetching,
    retryKpis: kpisQuery.refetch,

    sales: salesQuery.data,
    salesLoading: salesQuery.isLoading,
    salesError: salesQuery.error,
    salesFetching: salesQuery.isFetching,
    retrySales: salesQuery.refetch,

    orders: ordersQuery.data,
    ordersLoading: ordersQuery.isLoading,
    ordersError: ordersQuery.error,
    ordersFetching: ordersQuery.isFetching,
    retryOrders: ordersQuery.refetch,

    stock: stockQuery.data,
    stockLoading: stockQuery.isLoading,
    stockError: stockQuery.error,
    stockFetching: stockQuery.isFetching,
    retryStock: stockQuery.refetch,

    lowStock: lowStockQuery.data,
    lowStockLoading: lowStockQuery.isLoading,
    lowStockError: lowStockQuery.error,
    lowStockFetching: lowStockQuery.isFetching,
    retryLowStock: lowStockQuery.refetch,
  };
};
