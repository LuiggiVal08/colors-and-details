export interface BoxRegister {
  id: number;
  nombre: string;
  monto_inicial: number;
  monto?: number;
  descripcion?: string;
  ubicacion?: string;
  empresa_id?: number;
  activo: boolean;
  controlActual?: ControlCaja;
  created_at: string;
  updated_at: string;
}

export interface ControlCaja {
  id: number;
  caja_id: number;
  caja_nombre?: string;
  usuario_id: number;
  usuario_nombre?: string;
  caja?: BoxRegister;
  usuario?: { id: number; username: string };
  monto_apertura: number;
  monto_cierre?: number;
  apertura: string;
  cierre?: string;
  activo: boolean;
}

export interface CashMovement {
  id: number;
  control_id: number;
  control_caja_id?: number;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  descripcion: string;
  created_at: string;
  fecha?: string;
  usuario?: { id: number; username: string };
  usuario_nombre?: string;
}

export interface CreateCashMovementDTO {
  caja_id: string;
  tipo: 'ingreso' | 'egreso';
  monto: string;
  descripcion: string;
}

export interface ControlSummary {
  total_ingresos: number;
  total_egresos: number;
  saldo_esperado: number;
}
