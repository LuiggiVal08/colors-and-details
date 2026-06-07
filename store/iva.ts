import { create } from 'zustand';
import ivaService from '@/services/iva.service';

interface IVAState {
  id: number | null;
  porcentaje: number | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  setActual: (id: number, porcentaje: number) => void;
}

export const useIVAStore = create<IVAState>((set) => ({
  id: null,
  porcentaje: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await ivaService.getActual();
      set({ id: data.id, porcentaje: data.porcentaje, loading: false });
    } catch {
      set({ loading: false, error: 'No se pudo obtener el IVA' });
    }
  },

  setActual: (id: number, porcentaje: number) => {
    set({ id, porcentaje });
  },
}));
