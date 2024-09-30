import { z } from 'zod'
import { Types } from 'mongoose'

// Define the Zod schema for purchase money
export const purchaseMoneySchema = z.object({
  userId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: 'Invalid userId format',
  }),
  purchase_amount: z
    .number()
    .min(0, 'Purchase amount must be a positive number'),
  purchase_amount_history: z
    .array(
      z.object({
        purchase_from: z.string().refine((id) => Types.ObjectId.isValid(id), {
          message: 'Invalid purchase_from format',
        }),
        purchase_amount: z
          .number()
          .min(0, 'Purchase amount must be a positive number'),
        date: z.string(),
      }),
    )
    .optional(),
  joining_cost_history: z
    .array(
      z.object({
        new_partner_id: z.string().refine((id) => Types.ObjectId.isValid(id), {
          message: 'Invalid new_partner_id format',
        }),
        date: z.string(),
      }),
    )
    .optional(),
})
