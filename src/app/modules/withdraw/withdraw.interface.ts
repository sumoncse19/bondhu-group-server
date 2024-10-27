import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'

export interface IWithdrawMoney {
  userId: Types.ObjectId | string
  payment_method: PaymentMethod
  account_no: string
  bank_name?: string
  bank_branch?: string
  routing_no?: string
  swift_code?: string
  withdraw_amount: number
  security_code: string
  withdraw_wallet:
    | 'income_wallet'
    | 'project_share_wallet'
    | 'fixed_deposit_wallet'
    | 'share_holder_wallet'
    | 'directorship_wallet'
  withdraw_status?: 'pending' | 'approved'
  is_withdrawn?: boolean
}
