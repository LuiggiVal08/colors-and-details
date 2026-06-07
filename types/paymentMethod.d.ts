export interface PaymentMethod {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  activo: boolean;
  comision?: string;
}

export type CreatePaymentMethodDTO = Omit<PaymentMethod, 'id'>;

export type UpdatePaymentMethodDTO = Partial<Omit<PaymentMethod, 'id'>>;
