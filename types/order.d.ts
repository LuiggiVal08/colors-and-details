export type OrderStatus = 'pendiente' | 'procesado' | 'completado' | 'cancelado';

export type OrderPaymentStatus = 'sin_pago' | 'parcial' | 'pagado';

export interface OrderDetail {
  id: number;
  pedido_id: number;
  producto_id: number;
  detalle_pedido_producto?: string;
  cantidad: number;
  precio_unitario: number;
  precio_pedido_producto: number;
  subtotal: number;
  producto_nombre?: string;
  producto_codigo?: string;
}

export interface Order {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  usuario_id: number;
  usuario_nombre: string;
  iva_id: number;
  iva_porcentaje: number;
  fecha: string;
  fecha_entrega: string | null;
  estado: OrderStatus;
  total: number;
  total_pagado: number;
  saldo_pendiente: number;
  estado_pago: OrderPaymentStatus;
  observaciones?: string;
  detalles: OrderDetail[];
  pagos: OrderPayment[];
}

export interface OrderPayment {
  id: number;
  pedido_id: number;
  metodo_pago_id: number;
  metodo_pago_nombre: string;
  monto: number;
  fecha: string;
  referencia_pago?: string;
  usuario_id?: number;
}

export interface CreateOrderDetailDTO {
  producto_id: string;
  detalle_pedido_producto?: string;
  cantidad: string;
  precio_unitario: string;
  precio_pedido_producto: string;
  subtotal: string;
}

export interface CreateOrderDTO {
  cliente_id: string;
  iva_id: string;
  fecha: string;
  fecha_entrega?: string;
  total: string;
  observaciones?: string;
  detalles: CreateOrderDetailDTO[];
}

export interface CreateOrderPaymentDTO {
  pedido_id: string;
  metodo_pago_id: string;
  monto: string;
  referencia_pago?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
}
