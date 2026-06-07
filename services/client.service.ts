import { type Client, type CreateClientDTO, type UpdateClientDTO } from '@/types/client';
import api from './api';

const clientService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<Client[]> => {
    const { data } = await api.get<Client[]>('/customer', { params: { page, limit } });
    return data;
  },
  getById: async (id: string): Promise<Client> => {
    const { data } = await api.get<Client>(`/customer/${id}`);
    return data;
  },
  create: async (payload: CreateClientDTO): Promise<Client> => {
    const { data } = await api.post<Client>('/customer', payload);
    return data;
  },
  update: async (id: string, payload: UpdateClientDTO): Promise<Client> => {
    const { data } = await api.put(`/customer/${id}`, payload);
    return data;
  },
  search: async (query: string, page: number = 1, limit: number = 20): Promise<Client[]> => {
    const { data } = await api.get<Client[]>('/customer', {
      params: { search: query, page, limit },
    });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customer/${id}`);
  },
};

export default clientService;
