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
      PaymentMethod.CASH,
      PaymentMethod.BKASH,
      PaymentMethod.NAGAD,
      PaymentMethod.ROCKET,
      PaymentMethod.BANK,
    ]),
    bank_name: z.string().optional(),
    bank_account_name: z.string().optional(),
    branch_name: z.string().optional(),
    account_no: z.string().optional(),
    routing_no: z.string().optional(),
    swift_code: z.string().optional(),
    withdraw_amount: z.number().min(500, 'Minimum withdraw amount 500'),
    security_code: z
      .string()
      .min(4, 'Security code must be at least 4 digits long'),
    withdraw_wallet: z.enum([
      'reference_bonus',
      'matching_bonus',
      'project_share_wallet',
      'fixed_deposit_wallet',
      'share_holder_wallet',
      'directorship_wallet',
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
      if (!data.branch_name) {
        ctx.addIssue({
          code: 'custom',
          path: ['branch_name'],
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
