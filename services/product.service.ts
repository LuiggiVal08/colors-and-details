import api from './api';
import type { CreateProductPayload, ProductApiItem, ProductItem, UpdateProductPayload } from '@/feature/inventory/types';

interface GetAllParams {
  search?: string;
  categoria_id?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

const mapProduct = (item: ProductApiItem): ProductItem => {
  const precio = typeof item.precio === 'string' ? Number(item.precio) : item.precio;
  const stock = typeof item.stock === 'string' ? Number(item.stock) : item.stock;
  const categoria = item.categoria?.nombre ?? 'Sin categoría';

  return {
    id: item.id,
    codigo: item.codigo,
    nombre: item.nombre,
    descripcion: item.descripcion,
    categoria,
    categoriaId: item.categoria_id,
    precio,
    stock,
    imagen: item.imagen,
    estado: stock > 0 ? 'stock' : 'agotado',
  };
};

const productService = {
  getAll: async ({
    search = '',
    categoria_id = '',
    lowStock = false,
    page = 1,
    limit = 20,
  }: GetAllParams = {}): Promise<ProductItem[]> => {
    const params: Record<string, string | number | boolean> = { page, limit };
    if (search) params.search = search;
    if (categoria_id) params.categoria_id = categoria_id;
    if (lowStock) params.lowStock = true;

    const { data } = await api.get<ProductApiItem[]>('/product', { params });

    return data.map(mapProduct);
  },

  getById: async (id: string): Promise<ProductItem> => {
    const { data } = await api.get<ProductApiItem>(`/product/${id}`);
    return mapProduct(data);
  },

  create: async (payload: CreateProductPayload | FormData): Promise<ProductItem> => {
    const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
    type ProductCreateResponse = ProductApiItem | { producto: ProductApiItem };
    const response = await api.post<ProductCreateResponse>('/product', payload, config);
    const productData = 'producto' in response.data ? response.data.producto : response.data;
    return mapProduct(productData);
  },

  update: async (id: string, payload: UpdateProductPayload | FormData): Promise<ProductItem> => {
    const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
    type ProductUpdateResponse = ProductApiItem | { producto: ProductApiItem };
    const response = await api.put<ProductUpdateResponse>(`/product/${id}`, payload, config);
    const productData = 'producto' in response.data ? response.data.producto : response.data;
    return mapProduct(productData);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/product/${id}`);
  },
};

export default productService;
