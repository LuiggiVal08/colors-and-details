import api from './api';
import type { ServicePayment, CreateServicePaymentDTO } from '@/types/servicePayment';

const servicePaymentService = {
  create: async (payload: CreateServicePaymentDTO): Promise<ServicePayment> => {
    const { data } = await api.post<ServicePayment>('/service-payment/', payload);
    return data;
  },
};

export default servicePaymentService;
