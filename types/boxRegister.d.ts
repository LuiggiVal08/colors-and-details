export interface BoxRegister {
  id: number;
  nombre: string;
  monto_inicial: number;
  monto?: number;
  monto_usd?: number;
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
  monto_apertura_usd?: number;
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
  monto_usd?: number;
  moneda?: 'VES' | 'USD';
  medio_pago?: 'efectivo' | 'digital' | 'otros';
  caja_id?: number;
  metodo_pago_id?: number;
  referencia?: string;
  descripcion: string;
  created_at: string;
  fecha?: string;
  usuario?: { id: number; username: string };
  usuario_nombre?: string;
}

export interface CreateCashMovementDTO {
  caja_id: string;
  control_caja_id?: string;
  tipo: 'ingreso' | 'egreso';
  monto: string;
  monto_usd?: string;
  moneda?: 'VES' | 'USD';
  medio_pago?: 'efectivo' | 'digital' | 'otros';
  metodo_pago_id?: string;
  referencia?: string;
  descripcion: string;
}

export interface ControlSummary {
  total_ingresos: number;
  total_egresos: number;
  saldo_esperado: number;
  total_ingresos_usd?: number;
  total_egresos_usd?: number;
  saldo_esperado_usd?: number;
}
