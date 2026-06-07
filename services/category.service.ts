import api from './api';
import type { CategoryApiItem, CategoryItem } from '@/feature/inventory/types';

const mapCategory = (item: CategoryApiItem): CategoryItem => {
  return {
    id: String(item.id),
    nombre: item.nombre,
    descripcion: item.descripcion,
    productCount: item.productos?.length ?? 0,
  };
};

interface GetAllParams {
  search?: string;
  page?: number;
  limit?: number;
}

const categoryService = {
  getAll: async ({ search = '', page = 1, limit = 20 }: GetAllParams = {}): Promise<CategoryItem[]> => {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    const { data } = await api.get<CategoryApiItem[]>('/category', { params });
    return data.map(mapCategory);
  },
  getById: async (id: string): Promise<CategoryItem> => {
    const { data } = await api.get<CategoryApiItem>(`/category/${id}`);
    return mapCategory(data);
  },
  create: async (payload: { nombre: string; descripcion?: string }): Promise<CategoryItem> => {
    const { data } = await api.post<CategoryApiItem>('/category', payload);
    return mapCategory(data);
  },
  update: async (id: string, payload: { nombre: string; descripcion?: string }): Promise<CategoryItem> => {
    const { data } = await api.put<CategoryApiItem>(`/category/${id}`, payload);
    return mapCategory(data);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/category/${id}`);
  },
};

export default categoryService;
