export type FrecuenciaPago = 'mensual' | 'quincenal' | 'semanal';

export interface EmployeeNomina {
  id: number;
  monto: string;
  fecha_inicio: string;
  fecha_fin: string;
  bono?: string;
  deduccion?: string;
  monto_usd?: string;
  descripcion?: string;
  tasa?: {
    id: number;
    tasa: string;
    cambio?: string;
    fecha?: string;
  };
}

export interface Employee {
  id: number;
  empresa_id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
  fecha_ingreso: string;
  salario_base: string;
  frecuencia_pago: FrecuenciaPago;
  activo: boolean;
  empresa?: unknown;
  nominas?: EmployeeNomina[];
}

export interface CreateEmployeeDTO {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
  salario_base: string;
  frecuencia_pago: FrecuenciaPago;
  activo?: boolean;
  empresa_id: number;
}

export type UpdateEmployeeDTO = Partial<CreateEmployeeDTO>;
