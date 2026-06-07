import api from './api';
import type { CashMovement, CreateCashMovementDTO } from '@/types/boxRegister';

function normalizeMovement(raw: Record<string, unknown>): CashMovement {
  return {
    id: Number(raw.id),
    control_id: Number(raw.control_id || raw.control_caja_id),
    control_caja_id: raw.control_caja_id != null ? Number(raw.control_caja_id) : undefined,
    tipo: (raw.tipo as 'ingreso' | 'egreso') || 'ingreso',
    monto: parseFloat(String(raw.monto || 0)),
    descripcion: (raw.descripcion as string) || '',
    created_at: (raw.created_at as string) || (raw.fecha as string) || '',
    fecha: (raw.fecha as string) || (raw.created_at as string) || undefined,
    usuario: raw.usuario ? (raw.usuario as { id: number; username: string }) : undefined,
    usuario_nombre: (raw.usuario_nombre as string) || '',
  };
}

const cashMovementService = {
  getByBox: async (boxId: string): Promise<CashMovement[]> => {
    const { data } = await api.get<Record<string, unknown> | Record<string, unknown>[]>(`/cash-movements/by-box/${boxId}`);
    if (Array.isArray(data)) {
      return data.map(normalizeMovement);
    }
    const wrapped = data as Record<string, unknown>;
    const raw = wrapped.data;
    if (Array.isArray(raw)) return raw.map(normalizeMovement);
    return [];
  },

  getByControl: async (controlId: string): Promise<CashMovement[]> => {
    const { data } = await api.get<Record<string, unknown> | Record<string, unknown>[]>(`/cash-movements/by-control/${controlId}`);
    if (Array.isArray(data)) {
      return data.map(normalizeMovement);
    }
    const wrapped = data as Record<string, unknown>;
    const raw = wrapped.data;
    if (Array.isArray(raw)) return raw.map(normalizeMovement);
    return [];
  },

  getById: async (id: string): Promise<CashMovement> => {
    const { data } = await api.get<Record<string, unknown>>(`/cash-movements/${id}`);
    const wrapped = data as Record<string, unknown>;
    if (wrapped.data && typeof wrapped.data === 'object') {
      return normalizeMovement(wrapped.data as Record<string, unknown>);
    }
    return normalizeMovement(data);
  },

  create: async (payload: CreateCashMovementDTO): Promise<CashMovement> => {
    const { data } = await api.post<Record<string, unknown>>('/cash-movements', payload);
    if (Array.isArray(data)) return normalizeMovement(data[0]);
    const wrapped = data as Record<string, unknown>;
    if (wrapped.data && typeof wrapped.data === 'object' && !Array.isArray(wrapped.data)) {
      return normalizeMovement(wrapped.data as Record<string, unknown>);
    }
    if (wrapped.data && Array.isArray(wrapped.data)) {
      return normalizeMovement(wrapped.data[0]);
    }
    return normalizeMovement(data);
  },
};

export default cashMovementService;
