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
  referencia?: string;
}

export interface ShoppingCart {
  items: CartItem[];
  cliente_id?: number;
  cliente_nombre?: string;
  observaciones?: string;
}
