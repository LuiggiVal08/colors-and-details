import api from './api';
import type {
  CreateOrderDTO,
  CreateOrderPaymentDTO,
  Order,
  OrderDetail,
  OrderPayment,
  OrderPaymentStatus,
  OrderListParams,
} from '@/types/order';

function normalizeOrder(raw: Record<string, unknown>): Order {
  const cliente = raw.cliente as Record<string, unknown> | undefined;
  const usuario = raw.usuario as Record<string, unknown> | undefined;
  const iva = raw.iva as Record<string, unknown> | undefined;
  const empleado = usuario?.empleado as Record<string, unknown> | undefined;
  const rawPagos = raw.pagos as Record<string, unknown>[] | undefined;
  const rawDetalles = raw.detalles as Record<string, unknown>[] | undefined;

  const pagos = (rawPagos ?? []).map(normalizePayment);
  const total = Number(raw.total);
  const ivaPorcentaje = Number(iva?.porcentaje ?? 0);
  const totalConIva = total + total * (ivaPorcentaje / 100);
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const saldoPendiente = totalConIva - totalPagado;

  let estadoPago: OrderPaymentStatus = 'sin_pago';
  if (totalPagado >= totalConIva) estadoPago = 'pagado';
  else if (totalPagado > 0) estadoPago = 'parcial';

  return {
    id: Number(raw.id),
    cliente_id: Number(raw.cliente_id),
    cliente_nombre: cliente
      ? `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.trim()
      : '',
    usuario_id: Number(raw.usuario_id),
    usuario_nombre: empleado
      ? `${empleado.nombre ?? ''} ${empleado.apellido ?? ''}`.trim()
      : (usuario?.username as string) ?? '',
    iva_id: Number(raw.iva_id),
    iva_porcentaje: ivaPorcentaje,
    fecha: raw.fecha as string,
    fecha_entrega: (raw.fecha_entrega as string) ?? null,
    estado: raw.estado as Order['estado'],
    total,
    total_pagado: totalPagado,
    saldo_pendiente: Math.max(0, saldoPendiente),
    estado_pago: estadoPago,
    observaciones: raw.observaciones as string | undefined,
    detalles: (rawDetalles ?? []).map(normalizeDetail),
    pagos,
  };
}

function normalizeDetail(raw: Record<string, unknown>): OrderDetail {
  const producto = raw.producto as Record<string, unknown> | undefined;
  return {
    id: Number(raw.id),
    pedido_id: Number(raw.pedido_id),
    producto_id: Number(raw.producto_id),
    detalle_pedido_producto: raw.detalle_pedido_producto as string | undefined,
    cantidad: Number(raw.cantidad),
    precio_unitario: Number(raw.precio_unitario),
    precio_pedido_producto: Number(raw.precio_pedido_producto),
    subtotal: Number(raw.subtotal),
    producto_nombre: producto?.nombre as string | undefined,
    producto_codigo: producto?.codigo as string | undefined,
  };
}

function normalizePayment(raw: Record<string, unknown>): OrderPayment {
  const metodo = raw.metodo as Record<string, unknown> | undefined;
  return {
    id: Number(raw.id),
    pedido_id: Number(raw.pedido_id),
    metodo_pago_id: Number(raw.metodo_pago_id),
    metodo_pago_nombre: (metodo?.nombre as string) ?? '',
    monto: Number(raw.monto),
    fecha: raw.fecha as string,
    referencia_pago: raw.referencia_pago as string | undefined,
    usuario_id: raw.usuario_id ? Number(raw.usuario_id) : undefined,
  };
}

const orderService = {
  getAll: async (_params?: OrderListParams): Promise<Order[]> => {
    const params: Record<string, string | number> = {};
    if (_params?.page) params.page = _params.page;
    if (_params?.limit) params.limit = _params.limit;
    const { data } = await api.get<Record<string, unknown>[]>('/orders', { params });
    return (data ?? []).map(normalizeOrder);
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await api.get<Record<string, unknown>>(`/orders/${id}`);
    return normalizeOrder(data);
  },

  create: async (payload: CreateOrderDTO): Promise<Order> => {
    const { data } = await api.post<Record<string, unknown>>('/orders', payload);
    return normalizeOrder(data);
  },

  updateStatus: async (id: number, estado: Order['estado']): Promise<Order> => {
    const { data } = await api.put<Record<string, unknown>>(`/orders/${id}`, {
      estado,
    });
    return normalizeOrder(data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  getPayments: async (pedidoId: number): Promise<OrderPayment[]> => {
    const { data } = await api.get<Record<string, unknown>[]>('/order-payment', {
      params: { pedido_id: pedidoId },
    });
    return (data ?? []).map(normalizePayment);
  },

  createPayment: async (payload: CreateOrderPaymentDTO): Promise<OrderPayment> => {
    const { data } = await api.post<Record<string, unknown>>(
      '/order-payment',
      payload
    );
    return normalizePayment(data);
  },
};

export default orderService;
