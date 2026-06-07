import { create } from 'zustand';
import exchangeRateService from '@/services/exchangeRate.service';

interface ExchangeRateState {
  tasaId: number | null;
  tasa: number | null;
  cambio: number | undefined;
  fecha: string | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  setTasa: (tasa: number, cambio?: number) => void;
}

export const useExchangeRateStore = create<ExchangeRateState>((set) => ({
  tasaId: null,
  tasa: null,
  cambio: undefined,
  fecha: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await exchangeRateService.getActual();
      set({ tasaId: data.id, tasa: data.tasa, cambio: data.cambio, fecha: data.fecha, loading: false });
    } catch {
      set({ loading: false, error: 'No se pudo obtener la tasa' });
    }
  },

  setTasa: (tasa: number, cambio?: number) => {
    set({ tasa, cambio, fecha: new Date().toISOString() });
  },
}));
