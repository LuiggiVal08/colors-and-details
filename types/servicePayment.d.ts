export interface ServicePayment {
  id: number;
  service_period_id: number;
  amount: string;
  descripcion?: string;
  fecha: string;
  usuario?: { id: number; nombre: string } | null;
  metodo_pago?: { id: number; nombre: string } | null;
}

export interface CreateServicePaymentDTO {
  periodo_id: number;
  monto: number;
  descripcion?: string;
  metodo_pago_id?: number;
}
