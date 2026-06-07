import { type PaymentMethod, type CreatePaymentMethodDTO, type UpdatePaymentMethodDTO } from '@/types/paymentMethod';
import api from './api';

const paymentMethodService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<PaymentMethod[]> => {
    const response = await api.get<PaymentMethod[]>('/payment-method', { params: { page, limit } });
    return response.data;
  },
  getById: async (id: string): Promise<PaymentMethod> => {
    const response = await api.get<PaymentMethod>(`/payment-method/${id}`);
    return response.data;
  },
  create: async (data: CreatePaymentMethodDTO): Promise<PaymentMethod> => {
    const response = await api.post<PaymentMethod>('/payment-method', data);
    return response.data;
  },
  update: async (id: string, data: UpdatePaymentMethodDTO): Promise<PaymentMethod> => {
    const response = await api.put<PaymentMethod>(`/payment-method/${id}`, data);
    return response.data;
  },
  search: async (query: string, tipo?: string, page: number = 1, limit: number = 20): Promise<PaymentMethod[]> => {
    const params: any = { search: query, page, limit };
    if (tipo) params.tipo = tipo;
    const { data } = await api.get<PaymentMethod[]>('/payment-method', { params });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/payment-method/${id}`);
  },
};

export default paymentMethodService;
