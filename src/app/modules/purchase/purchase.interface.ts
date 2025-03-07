import { Types } from 'mongoose'

export interface IPurchaseMoney {
  userId: Types.ObjectId | string
  purchase_amount: number
  purchase_from: Types.ObjectId
  date: string
  purchase_amount_history: {
    purchase_from: Types.ObjectId
    purchase_amount: number
    date: string
  }[]
  joining_cost_history: {
    new_partner_id: Types.ObjectId | string
    partner_serial_number: string
    partner_name: string
    partner_user_name: string
    date: string
  }[]
}
