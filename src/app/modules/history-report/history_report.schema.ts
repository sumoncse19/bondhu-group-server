import { z } from 'zod'
import { PaymentMethod } from '../shared/add_money.enumeration'
import { Types } from 'mongoose'

// Define the history schema for adding money (add_money_history)
export const addMoneyHistorySchema = z.object({
  userId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: 'Invalid userId format',
  }),
  project_share: z.number().min(0, 'Total project must be a positive number'),
  fixed_deposit: z.number().min(0, 'Fixed deposit must be a positive number'),
  share_holder: z
    .number()
    .min(0, 'Shareholder amount must be a positive number'),
  directorship: z
    .number()
    .min(0, 'Directorship amount must be a positive number'),
  total_amount: z.number().min(0, 'Total amount must be a positive number'),
  money_receipt_number: z.string(),
  phone: z
    .string()
    .min(11, 'Phone number must be 11 characters')
    .max(11, 'Phone number must be 11 characters'),
  payment_method: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.BKASH,
    PaymentMethod.NAGAD,
    PaymentMethod.ROCKET,
    PaymentMethod.BANK,
  ]),
  bank_name: z.string().optional(),
  bank_account_name: z.string().optional(), // make sure the key matches
  branch_name: z.string().optional(),
  transaction_id: z.string().optional(),
  payment_picture: z.string(),
  picture: z.string().optional(),
  date: z.string().optional(),
})
