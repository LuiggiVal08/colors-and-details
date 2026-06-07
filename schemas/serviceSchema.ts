import { z } from 'zod';

export const serviceSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  proveedor: z.string().optional(),
  precio: z.string().min(1, 'El precio es obligatorio'),
  dia_corte: z.string().min(1, 'El día de corte es obligatorio'),
});

export const serviceEditSchema = z.object({
  empresa_id: z.string().min(1),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  proveedor: z.string().optional(),
  precio: z.string().min(1, 'El precio es obligatorio'),
  dia_corte: z.string().min(1, 'El día de corte es obligatorio'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type ServiceEditFormData = z.infer<typeof serviceEditSchema>;
