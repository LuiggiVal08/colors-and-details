import api from './api';
import type { MovementApiItem, InventoryMovement } from '@/feature/inventory/types';

interface GetAllParams {
  search?: string;
  tipo?: 'entrada' | 'salida' | '';
  page?: number;
  limit?: number;
  producto_id?: string;
}

const toNumber = (val: string | number | undefined | null): number => {
  if (val === null || val === undefined) return 0;
  return typeof val === 'string' ? Number(val) : val;
};

const mapMovement = (item: MovementApiItem): InventoryMovement => {
  const stockActual = item.stock_despues !== undefined ? toNumber(item.stock_despues) : 0;
  const usuarioNombre = item.usuario
    ? `${item.usuario.nombre}${item.usuario.apellido ? ` ${item.usuario.apellido}` : ''}`
    : undefined;

  return {
    id: item.id,
    fecha: item.fecha,
    producto: item.producto?.nombre ?? 'Producto desconocido',
    producto_id: item.producto_id,
    tipo: item.tipo,
    cantidad: toNumber(item.cantidad),
    motivo: item.motivo ?? item.observacion ?? '',
    stockActual,
    stock_antes: item.stock_antes !== undefined ? toNumber(item.stock_antes) : undefined,
    stock_despues: item.stock_despues !== undefined ? toNumber(item.stock_despues) : undefined,
    usuario_id: item.usuario_id,
    usuario_nombre: usuarioNombre,
  };
};

const productMovementService = {
  getAll: async ({ search = '', tipo = '', producto_id = '', page = 1, limit = 20 }: GetAllParams = {}): Promise<InventoryMovement[]> => {
    const params: Record<string, string | number> = { page, limit };
    if (search) params.search = search;
    if (tipo) params.tipo = tipo;
    if (producto_id) params.producto_id = producto_id;

    const { data } = await api.get<MovementApiItem[]>('/product-movement', { params });

    return data.map(mapMovement);
  },

  getById: async (id: string): Promise<InventoryMovement> => {
    const { data } = await api.get<MovementApiItem | { movimiento: MovementApiItem }>(`/product-movement/${id}`);
    const item = 'movimiento' in data ? data.movimiento : data;
    return mapMovement(item);
  },

  create: async (payload: {
    producto_id: string;
    usuario_id: string;
    tipo: 'entrada' | 'salida';
    cantidad: string;
    observacion?: string;
  }): Promise<InventoryMovement> => {
    const { data } = await api.post<{ movimiento: MovementApiItem }>('/product-movement', payload);
    return mapMovement(data.movimiento);
  },
};

export default productMovementService;
