import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'

export interface IShareHolderPayment {
  userId: Types.ObjectId | string
  add_money_history_id: Types.ObjectId | string
  payment_method: PaymentMethod
  money_receipt_number: string
  share_holder_amount: number
  payment_date: string
  is_paid: boolean
}

export interface IShareHolderProfit {
  share_holder_payment_id: Types.ObjectId | string
  profit_amount: number
  profit_date: string
}
