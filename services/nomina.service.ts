import api from './api';
import type { Nomina, NominaGenerateResponse, GenerateNominaDTO } from '@/types/nomina';

const nominaService = {
  getAll: async (): Promise<Nomina[]> => {
    const { data } = await api.get<Nomina[]>('/nomina');
    return data;
  },

  getById: async (id: string): Promise<Nomina> => {
    const { data } = await api.get<Nomina>(`/nomina/${id}`);
    return data;
  },

  generate: async (payload: GenerateNominaDTO): Promise<NominaGenerateResponse> => {
    const { data } = await api.post<NominaGenerateResponse>('/nomina/generate', payload);
    return data;
  },
};

export default nominaService;
