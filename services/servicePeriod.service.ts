import api from './api';
import type { ServicePeriod, CreateServicePeriodDTO } from '@/types/servicePeriod';

const servicePeriodService = {
  getByService: async (servicioId: number): Promise<ServicePeriod[]> => {
    const { data } = await api.get(`/service-period/by-service/${servicioId}`);
    const raw = data?.data ?? data?.periods ?? data;
    if (Array.isArray(raw)) return raw;
    return [];
  },

  create: async (payload: CreateServicePeriodDTO): Promise<ServicePeriod> => {
    const { data } = await api.post<ServicePeriod>('/service-period/', payload);
    return data;
  },
};

export default servicePeriodService;
