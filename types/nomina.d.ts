export interface NominaDetalle {
  id: number;
  nomina_id: number;
  empleado_id: number;
  salario_base: string;
  bono: string;
  deduccion: string;
  monto_total: string;
  monto_usd: string;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface Nomina {
  id: number;
  empresa_id: number;
  usuario_id: number;
  tasa_id: number;
  periodo_inicio: string;
  periodo_fin: string;
  estado: 'processing' | 'completed' | 'failed';
  total_empleados: number;
  total_monto: string;
  creado_en: string;
  actualizado_en: string;
  usuario?: {
    id: number;
    username: string;
  };
  tasa?: {
    id: number;
    tasa: string;
    cambio?: string;
    fecha?: string;
  };
  detalles?: NominaDetalle[];
}

export interface GenerateNominaDTO {
  periodo_inicio: string;
  periodo_fin: string;
}

export interface NominaGenerateResponse {
  message: string;
  jobId: string;
}

export interface NominaSocketEvent {
  nomina_id: number;
  estado: 'completed' | 'failed';
  total_empleados: number;
  total_monto: number;
  tasa: string;
  periodo_inicio: string;
  periodo_fin: string;
}
