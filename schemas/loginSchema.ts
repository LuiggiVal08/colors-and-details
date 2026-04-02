import { z } from 'zod';

export const loginSchema = z.object({
  // .trim() evita que el usuario mande espacios vacíos al inicio o final
  username: z
    .string()
    .trim()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(25, 'El usuario no puede exceder los 25 caracteres')
    // Corregido: 0-9 para aceptar todos los números
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),

  password: z
    .string()
    .trim()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(20, 'La contraseña no puede exceder los 20 caracteres')
    // Opcional: Validar complejidad si es un registro, para login suele bastar el min/max
    .refine((val) => /[A-Z]/.test(val), {
      message: 'La contraseña debe incluir al menos una mayúscula',
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'La contraseña debe incluir al menos un número',
    }),
});
