export interface CartItem {
  producto_id: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stockDisponible: number;
}

export interface PaymentEntry {
  metodo_pago_id: number;
  metodo_pago_nombre: string;
  monto: number;
  moneda: 'USD' | 'VES';
  referencia?: string;
  montoRecibido?: number;
  montoAplicado?: number;
  montoUsd?: number;
  vueltoUsd?: number;
  vueltoBs?: number;
  medioPago?: 'efectivo' | 'digital' | 'otros';
}

export interface ShoppingCart {
  items: CartItem[];
  cliente_id?: number;
  cliente_nombre?: string;
  observaciones?: string;
}
