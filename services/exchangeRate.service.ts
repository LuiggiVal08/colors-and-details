import api from './api';

export interface ExchangeRate {
  id: number;
  tasa: number;
  cambio?: number;
  activa: boolean;
  fecha: string;
  usuario?: { id: number; nombre: string } | null;
}

const exchangeRateService = {
  getActual: async (): Promise<ExchangeRate> => {
    const { data } = await api.get<ExchangeRate>('/exchange-rate/actual');
    return data;
  },

  getAll: async (): Promise<ExchangeRate[]> => {
    const { data } = await api.get<ExchangeRate[]>('/exchange-rate');
    return data;
  },

  create: async (tasa: string, usuarioId: number): Promise<ExchangeRate> => {
    const { data } = await api.post<ExchangeRate>('/exchange-rate', {
      usuario_id: String(usuarioId),
      tasa: tasa.trim().replace('.', ','),
    });
    return data;
  },
};

export default exchangeRateService;
