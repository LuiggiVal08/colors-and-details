import { z } from 'zod';

export const paymentMethodSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  tipo: z.string().min(1, 'Tipo requerido'),
  activo: z.boolean().default(true),
  comision: z.string().optional(),
});

export type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;
