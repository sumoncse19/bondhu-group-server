import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'

export interface IAddMoneyHistory {
  userId: Types.ObjectId
  project_share: number
  fixed_deposit: number
  share_holder: number
  directorship: number
  total_amount: number
  money_receipt_number: string
  phone: string
  payment_method: PaymentMethod
  bank_name: string
  bank_account_name: string
  branch_name: string
  transaction_id: string
  payment_picture: string
  picture: string
  is_approved: boolean
  date: string
}

export interface ReferralBonusDetail {
  bonus_from: Types.ObjectId
  reference_bonus_amount: number
  type: string
  date: string
}

export interface IReferralBonusHistory {
  userId: Types.ObjectId
  total_referral_history: number
  referral_bonus_history: ReferralBonusDetail[]
}

export interface MatchingBonusDetail {
  matching_bonus_amount: number
  type: string
  date: string
}

export interface IMatchingBonusHistory {
  userId: Types.ObjectId
  total_matching_history: number
  matching_bonus_history: MatchingBonusDetail[]
}
