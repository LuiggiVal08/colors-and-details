import { z } from 'zod';

export const clientSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  apellido: z.string().min(3, 'Apellido debe tener al menos 3 caracteres'),
  cedula: z.string().min(6, 'Cédula debe tener al menos 6 caracteres'),
  telefono: z.string().min(6, 'Teléfono debe tener al menos 6 caracteres'),
  email: z.string().email('Email inválido'),
  direccion: z.string().min(1, 'Dirección requerida'),
  activo: z.boolean().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
