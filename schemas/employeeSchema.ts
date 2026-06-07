import { z } from 'zod';

export const employeeSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  cedula: z.string().min(6, 'Cédula debe tener al menos 6 caracteres'),
  telefono: z.string().min(6, 'Teléfono debe tener al menos 6 caracteres'),
  email: z.string().email('Email inválido'),
  direccion: z.string().min(1, 'Dirección requerida'),
  salario_base: z.string().min(1, 'Salario base requerido'),
  frecuencia_pago: z.enum(['mensual', 'quincenal', 'semanal'], {
    required_error: 'Selecciona la frecuencia de pago',
  }),
  activo: z.boolean().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
