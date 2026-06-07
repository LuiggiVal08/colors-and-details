import type { Employee } from './employee';

export interface EmployeePayroll {
  id: number;
  empleado_id: number;
  nomina_id?: number;
  fecha_inicio: string;
  fecha_fin: string;
  monto: string;
  bono: string;
  deduccion: string;
  monto_usd: string;
  descripcion?: string;
  empleado?: Employee;
  tasa?: {
    id: number;
    tasa: string;
    cambio?: string;
    fecha?: string;
  };
}

export interface CreateEmployeePayrollDTO {
  empleado_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  monto: string;
  bono?: string;
  deduccion?: string;
  monto_usd?: string;
  descripcion?: string;
}

export type UpdateEmployeePayrollDTO = Partial<CreateEmployeePayrollDTO>;
