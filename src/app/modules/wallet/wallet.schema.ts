import { z } from 'zod'

export const shareHolderPaymentByDateSchema = z.object({
  date: z.string(),
})

export const shareHolderProfitSchema = z.object({
  share_holder_payment_id: z.string(),
  profit_amount: z.number(),
  profit_date: z.string(),
})

export const directorshipProfitSchema = z.object({
  directorship_payment_id: z.string(),
  profit_amount: z.number(),
  profit_date: z.string(),
})
