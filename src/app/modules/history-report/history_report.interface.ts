import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'
import { IUser } from '../user/user.interface'

export interface IAddMoneyHistory {
  userId: Types.ObjectId
  name: string
  user_name: string
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
  account_no: string
  transaction_id: string
  payment_picture: string
  picture: string
  is_reject: boolean
  is_approved: boolean
  date: string
}

export interface ReferralBonusDetail {
  bonus_from: string
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

export interface ClubBonusDetail {
  club_bonus_amount: number
  date: string
}

export interface IClubBonusHistory {
  userId: Types.ObjectId
  club_bonus_history: ClubBonusDetail[]
}

export interface ISendClubBonusToday {
  club_bonus_amount: number
  total_members: number
  bonus_per_member: number
  club_members: IUser[]
  date: string
}
