import { create } from 'zustand';
import boxRegisterService from '@/services/boxRegister.service';
import type { ControlCaja } from '@/types/boxRegister';

interface BoxRegisterState {
  activeBox: ControlCaja | null;
  loading: boolean;
  error: string | null;
  loadActiveBox: () => Promise<void>;
  setActiveBox: (control: ControlCaja | null) => void;
  clearBox: () => void;
}

export const useBoxRegisterStore = create<BoxRegisterState>((set) => ({
  activeBox: null,
  loading: false,
  error: null,

  loadActiveBox: async () => {
    set({ loading: true, error: null });
    try {
      const data = await boxRegisterService.getMiActual();
      set({ activeBox: data, loading: false });
    } catch {
      set({ loading: false, error: 'No se pudo obtener la caja activa' });
    }
  },

  setActiveBox: (control: ControlCaja | null) => {
    set({ activeBox: control });
  },

  clearBox: () => {
    set({ activeBox: null, error: null });
  },
}));
