import api from './api';
import type { BoxRegister, ControlCaja, ControlSummary } from '@/types/boxRegister';

function normalizeControl(raw: Record<string, unknown>): ControlCaja {
  const caja = raw.caja as Record<string, unknown> | undefined;
  return {
    id: Number(raw.id),
    caja_id: Number(raw.caja_id),
    caja_nombre: (raw.caja_nombre as string) || (caja?.nombre as string) || '',
    usuario_id: Number(raw.usuario_id),
    usuario_nombre: (raw.usuario_nombre as string) || '',
    caja: caja
      ? ({
          id: Number(caja.id),
          nombre: (caja.nombre as string) || '',
          monto_inicial: parseFloat(String(caja.monto_inicial || 0)),
          monto: caja.monto != null ? parseFloat(String(caja.monto)) : undefined,
          descripcion: caja.descripcion as string | undefined,
          ubicacion: caja.ubicacion as string | undefined,
          empresa_id: caja.empresa_id != null ? Number(caja.empresa_id) : undefined,
          activo: Boolean(caja.activo),
          created_at: (caja.created_at as string) || '',
          updated_at: (caja.updated_at as string) || '',
        } as BoxRegister)
      : undefined,
    usuario: raw.usuario
      ? (raw.usuario as { id: number; username: string })
      : undefined,
    monto_apertura: parseFloat(String(raw.monto_apertura || 0)),
    monto_cierre: raw.monto_cierre != null ? parseFloat(String(raw.monto_cierre)) : undefined,
    apertura: (raw.apertura as string) || (raw.fecha_apertura as string) || '',
    cierre: (raw.cierre as string) || (raw.fecha_cierre as string) || undefined,
    activo: (raw.estado as string) === 'abierto',
  };
}

function normalizeBox(raw: Record<string, unknown>): BoxRegister {
  const controlActualRaw = raw.controlActual as Record<string, unknown> | undefined;
  return {
    id: Number(raw.id),
    nombre: (raw.nombre as string) || '',
    monto_inicial: parseFloat(String(raw.monto_inicial || 0)),
    monto: raw.monto != null ? parseFloat(String(raw.monto)) : undefined,
    descripcion: raw.descripcion as string | undefined,
    ubicacion: raw.ubicacion as string | undefined,
    empresa_id: raw.empresa_id != null ? Number(raw.empresa_id) : undefined,
    activo: Boolean(raw.activo),
    controlActual: controlActualRaw ? normalizeControl(controlActualRaw) : undefined,
    created_at: (raw.created_at as string) || '',
    updated_at: (raw.updated_at as string) || '',
  };
}

const boxRegisterService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<BoxRegister[]> => {
    const { data } = await api.get<Record<string, unknown>[]>('/box-register', { params: { page, limit } });
    return (data || []).map(normalizeBox);
  },

  getById: async (id: string): Promise<BoxRegister> => {
    const { data } = await api.get<Record<string, unknown>>(`/box-register/${id}`);
    return normalizeBox(data);
  },

  create: async (payload: Partial<BoxRegister>): Promise<BoxRegister> => {
    const { data } = await api.post<Record<string, unknown>>('/box-register', payload);
    return normalizeBox(data);
  },

  update: async (id: string, payload: Partial<BoxRegister>): Promise<BoxRegister> => {
    const { data } = await api.put<Record<string, unknown>>(`/box-register/${id}`, payload);
    return normalizeBox(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/box-register/${id}`);
  },

  getMiActual: async (): Promise<ControlCaja | null> => {
    const { data } = await api.get<Record<string, unknown> | null>('/box-register-control/mi-actual');
    if (!data) return null;
    return normalizeControl(data);
  },

  getControlesByBox: async (cajaId: string): Promise<ControlCaja[]> => {
    const { data } = await api.get<Record<string, unknown> | Record<string, unknown>[]>(`/box-register-control/by-box/${cajaId}`);
    if (Array.isArray(data)) {
      return data.map(normalizeControl);
    }
    const wrapped = data as Record<string, unknown>;
    const raw = wrapped.data;
    if (Array.isArray(raw)) return raw.map(normalizeControl);
    return [];
  },

  getEstadoActual: async (cajaId: string): Promise<ControlCaja & ControlSummary> => {
    const { data } = await api.get<Record<string, unknown>>(`/box-register-control/actual/${cajaId}`);
    const normal = normalizeControl(data);
    return {
      ...normal,
      total_ingresos: parseFloat(String((data as Record<string, unknown>).total_ingresos || 0)),
      total_egresos: parseFloat(String((data as Record<string, unknown>).total_egresos || 0)),
      saldo_esperado: parseFloat(String((data as Record<string, unknown>).saldo_esperado || 0)),
    };
  },

  apertura: async (cajaId: string): Promise<ControlCaja> => {
    const { data } = await api.post<Record<string, unknown>>(`/box-register-control/apertura/${cajaId}`);
    return normalizeControl(data);
  },

  cierre: async (cajaId: string, montoCierre: number): Promise<ControlCaja> => {
    const { data } = await api.post<Record<string, unknown>>(`/box-register-control/cierre/${cajaId}`, { monto_cierre: montoCierre });
    return normalizeControl(data);
  },
};

export default boxRegisterService;
