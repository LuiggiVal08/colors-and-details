import api from './api';

export interface SaleDetailPayload {
  producto_id: string;
  cantidad: string;
  precio_unitario: string;
  subtotal: string;
}

export interface SalePaymentPayload {
  metodo_pago_id: string;
  monto: string;
  tasa_id: string;
  referencia_pago?: string;
}

export interface SalePayload {
  cliente_id: string;
  usuario_id: string;
  total: string;
  iva_id: string;
  observaciones?: string;
  detalles: SaleDetailPayload[];
  pagos: SalePaymentPayload[];
}

export interface SaleDetailResponse {
  producto_id: number;
  cantidad: number;
  producto_nombre?: string;
  subtotal?: number;
}

export interface SalePaymentResponse {
  id?: number;
  metodo_pago_id: number;
  metodo_pago_nombre?: string;
  monto: number;
  referencia_pago?: string | null;
  tasa_id?: number | null;
}

export interface Sale {
  id: number;
  cliente_id?: number;
  cliente_nombre?: string;
  total: number;
  fecha: string;
  observaciones?: string;
  detalles?: SaleDetailResponse[];
  pagos?: SalePaymentResponse[];
}

export interface SaleCreateResponse {
  venta: Sale;
  message: string;
}

const shoppingService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<Sale[]> => {
    const { data } = await api.get<Sale[]>('/shopping', { params: { page, limit } });
    return data;
  },

  getById: async (id: number): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/shopping/${id}`);
    return data;
  },

  create: async (payload: SalePayload): Promise<SaleCreateResponse> => {
    const { data } = await api.post<SaleCreateResponse>('/shopping', payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/shopping/${id}`);
  },
};

export default shoppingService;
