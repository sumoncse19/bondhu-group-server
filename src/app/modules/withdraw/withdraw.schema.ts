import { z } from 'zod'
import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'

// Define the Zod schema for withdraw money
export const withdrawMoneySchema = z
  .object({
    userId: z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: 'Invalid userId format',
    }),
    payment_method: z.enum([
      PaymentMethod.BKASH,
      PaymentMethod.NAGAD,
      PaymentMethod.ROCKET,
      PaymentMethod.BANK,
    ]),
    account_no: z.string().min(1, 'Account number is required'),
    bank_name: z.string().optional(),
    bank_branch: z.string().optional(),
    routing_no: z.string().optional(),
    swift_code: z.string().optional(),
    withdraw_amount: z
      .number()
      .min(1, 'Withdraw amount must be a positive number'),
    security_code: z
      .number()
      .int()
      .min(1000, 'Security code must be at least 4 digits long'),
    withdraw_wallet: z.enum([
      'income_wallet',
      'share_return',
      'fixed_deposit',
      'share_holder',
      'directorship',
    ]),
    withdraw_status: z.enum(['pending', 'approved']).default('pending'),
    is_withdrawn: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === PaymentMethod.BANK) {
      if (!data.bank_name) {
        ctx.addIssue({
          code: 'custom',
          path: ['bank_name'],
          message: 'Bank name is required when payment method is bank',
        })
      }
      if (!data.bank_branch) {
        ctx.addIssue({
          code: 'custom',
          path: ['bank_branch'],
          message: 'Bank branch is required when payment method is bank',
        })
      }
      if (!data.routing_no) {
        ctx.addIssue({
          code: 'custom',
          path: ['routing_no'],
          message: 'Routing number is required when payment method is bank',
        })
      }
    }
  })
