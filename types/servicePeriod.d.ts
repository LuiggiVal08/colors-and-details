export interface ServicePeriod {
  id: number;
  servicio_empresa_id: number;
  mes: number;
  anualidad: number;
  amount_due: string;
  amount_balance?: string;
  estado: string;
  fecha_generacion?: string;
  fecha_corte?: string;
  pago_tardio?: boolean;
  tiene_pagos?: boolean;
  descripcion?: string;
}

export interface CreateServicePeriodDTO {
  servicio_empresa_id: number;
  mes: number;
  anualidad: number;
  amount_due: number;
}
