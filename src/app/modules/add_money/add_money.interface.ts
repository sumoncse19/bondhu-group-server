import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'

export interface IAddMoney {
  userId: Types.ObjectId
  project_share: number
  fixed_deposit: number
  share_holder: number
  directorship: number
  total_amount: number
  total_point?: number
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
  add_money_history?: {
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
  }[]
}

export interface IRequestAddMoney {
  userId: Types.ObjectId
  project_share: number
  fixed_deposit: number
  share_holder: number
  directorship: number
  total_amount: number
  total_point?: number
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
  createdAt?: Date
  updatedAt?: Date
}
