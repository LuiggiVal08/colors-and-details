import api from './api';

export interface IVA {
  id: number;
  porcentaje: number;
  activo: boolean;
  fecha: string;
  usuario?: { id: number; nombre: string } | null;
  observacion?: string;
}

const ivaService = {
  getActual: async (): Promise<IVA> => {
    const { data } = await api.get<IVA>('/iva/actual');
    return data;
  },

  getAll: async (): Promise<IVA[]> => {
    const { data } = await api.get<IVA[]>('/iva/');
    return data;
  },

  create: async (porcentaje: number, observacion?: string): Promise<IVA> => {
    const { data } = await api.post<IVA>('/iva/', { porcentaje, observacion });
    return data;
  },
};

export default ivaService;
