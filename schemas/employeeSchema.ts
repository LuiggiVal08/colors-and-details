// En tu archivo de esquema/tipos
import { z } from 'zod';

export const employeeSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  cedula: z.string().min(6, 'Mínimo 6 caracteres'),
  telefono: z.string().min(6, 'Mínimo 6 caracteres'),
  email: z.string().email('Email inválido'),
  direccion: z.string().min(1, 'Requerida'),
  //   fecha_ingreso: z.coerce.date(), // El server espera un Date
  salario_base: z.string(), // El server espera un String
  activo: z.boolean().optional(),
  empresa_id: z.number().int(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
