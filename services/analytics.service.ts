import api from './api';

export interface SalesByDateItem {
  date: string;
  total: number;
}

export interface OrdersByMonthItem {
  month: string;
  quantity: number;
}

export interface StockByCategoryItem {
  category: string;
  totalItems: number;
  color: string;
}

export interface LowStockItem {
  product: string;
  stock: number;
}

export interface AnalyticsKPIs {
  totalSales: number;
  totalOrders: number;
  totalClients: number;
  totalProducts: number;
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

export const analyticsService = {
  getSalesByDate: async (startDate: Date): Promise<SalesByDateItem[]> => {
    const { data } = await api.get('/shopping');
    const sales: { fecha: string; total: string | number }[] = data || [];

    const filtered = sales.filter((s) => new Date(s.fecha) >= startDate);

    const salesByDate: Record<string, number> = {};
    filtered.forEach((sale) => {
      const dateKey = new Date(sale.fecha).toISOString().slice(0, 10);
      salesByDate[dateKey] = (salesByDate[dateKey] || 0) + Number(sale.total);
    });

    const labels = Object.keys(salesByDate).sort();
    return labels.map((date) => ({
      date,
      total: Math.round(salesByDate[date] * 100) / 100,
    }));
  },

  getOrdersByMonth: async (startDate: Date): Promise<OrdersByMonthItem[]> => {
    const { data } = await api.get('/orders');
    const orders: { fecha: string }[] = data || [];

    const filtered = orders.filter((o) => new Date(o.fecha) >= startDate);

    const ordersByMonth: Record<string, number> = {};
    filtered.forEach((order) => {
      const month = new Date(order.fecha).toISOString().slice(0, 7);
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
    });

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = Object.keys(ordersByMonth).sort();

    return labels.map((monthKey) => {
      const monthIndex = parseInt(monthKey.split('-')[1], 10) - 1;
      return {
        month: `${monthNames[monthIndex]} ${monthKey.split('-')[0]}`,
        quantity: ordersByMonth[monthKey],
      };
    });
  },

  getStockByCategory: async (): Promise<StockByCategoryItem[]> => {
    const [prodRes, catRes] = await Promise.all([api.get('/product'), api.get('/category')]);
    const products: { categoria_id: string; stock: string | number }[] = prodRes.data || [];
    const categories: { id: string; nombre: string }[] = catRes.data || [];

    const categoryMap: Record<string, string> = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.nombre;
    });

    const stockByCategory: Record<string, number> = {};
    products.forEach((prod) => {
      const catName = categoryMap[prod.categoria_id] || 'Sin Categoría';
      stockByCategory[catName] = (stockByCategory[catName] || 0) + Number(prod.stock);
    });

    return Object.entries(stockByCategory).map(([category, totalItems], index) => ({
      category,
      totalItems,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  },

  getLowStock: async (): Promise<LowStockItem[]> => {
    const { data } = await api.get('/product', { params: { lowStock: true } });
    const products: { nombre: string; stock: string | number }[] = data || [];

    return products
      .slice(0, 5)
      .map((p) => ({
        product: p.nombre,
        stock: Number(p.stock),
      }))
      .sort((a, b) => a.stock - b.stock);
  },

  getKPIs: async (): Promise<AnalyticsKPIs> => {
    const [salesRes, ordersRes, clientsRes, productsRes] = await Promise.all([
      api.get('/shopping'),
      api.get('/orders'),
      api.get('/customer'),
      api.get('/product'),
    ]);

    const sales: { total: string | number }[] = salesRes.data || [];
    const orders: unknown[] = ordersRes.data || [];
    const clients: unknown[] = clientsRes.data || [];
    const products: unknown[] = productsRes.data || [];

    const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders: orders.length,
      totalClients: clients.length,
      totalProducts: products.length,
    };
  },
};
