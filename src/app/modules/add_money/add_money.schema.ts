import { Types } from 'mongoose'
import { z } from 'zod'

// Define the schema for adding money
export const addMoneySchema = z.object({
  userId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: 'Invalid userId format',
  }),
  total_project: z.number().min(0, 'Total project must be a positive number'),
  total_project_amount: z.number().optional(),
  fixed_deposit: z.number().min(0, 'Fixed deposit must be a positive number'),
  share_holder: z
    .number()
    .min(0, 'Shareholder amount must be a positive number'),
  directorship: z
    .number()
    .min(0, 'Directorship amount must be a positive number'),
  total_amount: z.number().optional(),
  total_point: z.number().optional(),
})
