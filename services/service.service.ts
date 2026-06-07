import { type Servicio, type CreateServicioDTO, type UpdateServicioDTO } from '@/types/service';
import api from './api';

const serviceService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<Servicio[]> => {
    const response = await api.get<Servicio[]>('/service', { params: { page, limit } });
    return response.data;
  },
  getById: async (id: string): Promise<Servicio> => {
    const response = await api.get<Servicio>(`/service/${id}`);
    return response.data;
  },
  create: async (data: CreateServicioDTO): Promise<Servicio> => {
    const response = await api.post<Servicio>('/service', data);
    return response.data;
  },
  update: async (id: string, data: UpdateServicioDTO): Promise<Servicio> => {
    const response = await api.put<Servicio>(`/service/${id}`, data);
    return response.data;
  },
  search: async (query: string, page: number = 1, limit: number = 20): Promise<Servicio[]> => {
    const { data } = await api.get<Servicio[]>('/service', {
      params: { search: query, page, limit },
    });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/service/${id}`);
  },
};

export default serviceService;
