export interface Servicio {
  id: number;
  empresa_id: number;
  nombre: string;
  descripcion?: string;
  proveedor?: string;
  dia_corte: number;
  precio: string;
}

export interface ServicioPrecio {
  id: number;
  servicio_id: number;
  precio: string;
  fecha_inicio: string;
  fecha_fin?: string;
}

export type CreateServicioDTO = {
  nombre: string;
  descripcion?: string;
  proveedor?: string;
  precio: string;
  dia_corte: string;
  empresa_id: string;
  usuario_id: string;
};

export type UpdateServicioDTO = {
  empresa_id: string;
  nombre: string;
  descripcion?: string;
  proveedor?: string;
  precio: string;
  dia_corte: string;
};
