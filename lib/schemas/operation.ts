import { z } from 'zod'

/**
 * Schema for operation form validation
 */
export const operationSchema = z.object({
  assetId: z.number().int().positive('Debe seleccionar un activo'),
  date: z.date({
    required_error: 'La fecha es requerida',
    invalid_type_error: 'Fecha inválida',
  }),
  amount: z
    .number({
      required_error: 'El monto es requerido',
      invalid_type_error: 'Debe ser un número',
    })
    .positive('El monto debe ser mayor a 0')
    .max(1000000000, 'El monto es demasiado grande'),
  qty: z
    .number({
      invalid_type_error: 'Debe ser un número',
    })
    .positive('La cantidad debe ser mayor a 0')
    .max(1000000000, 'La cantidad es demasiado grande')
    .optional(),
})

export type OperationFormData = z.infer<typeof operationSchema>

/**
 * Schema for Operation entity (stored data)
 */
export const operationEntitySchema = z.object({
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato de fecha inválido (DD/MM/YYYY)'),
  ticker: z.string().min(1, 'Ticker es requerido'),
  amount: z.number().nonnegative('El monto no puede ser negativo'),
  qty: z.number().nonnegative('La cantidad no puede ser negativa'),
})

export type OperationEntity = z.infer<typeof operationEntitySchema>

/**
 * Schema for Asset entity
 */
export const assetSchema = z.object({
  id: z.number().int().positive(),
  category: z.string().min(1),
  ticker: z.string().min(1),
  percent: z.number().nonnegative(),
  months: z.record(
    z.string(),
    z.object({
      amount: z.number().nonnegative(),
      qty: z.number().nonnegative(),
    })
  ),
})

export type AssetEntity = z.infer<typeof assetSchema>
