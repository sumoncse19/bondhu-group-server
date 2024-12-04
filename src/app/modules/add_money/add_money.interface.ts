import { Types } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'

export interface IAddMoney {
  userId: Types.ObjectId
  name: string
  user_name: string
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
  account_no: string
  transaction_id?: string
  payment_picture: string
  picture?: string
  date: string
  is_reject?: boolean
  is_approved?: boolean
  add_money_history?: {
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
    transaction_id?: string
    payment_picture: string
    picture?: string
    date: string
    is_reject?: boolean
    is_approved?: boolean
  }[]
}

export interface IRequestAddMoney {
  userId: Types.ObjectId
  name: string
  user_name: string
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
  account_no: string
  transaction_id?: string
  payment_picture: string
  picture?: string
  date: string
  is_reject?: boolean
  is_approved?: boolean
  createdAt?: Date
  updatedAt?: Date
}
