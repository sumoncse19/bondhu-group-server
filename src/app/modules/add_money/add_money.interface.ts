import { Types } from 'mongoose'

export interface IAddMoney {
  userId: Types.ObjectId
  total_project: number
  total_project_amount?: number
  fixed_deposit: number
  share_holder: number
  directorship: number
  total_amount?: number
  total_point?: number
  user_accountable: {
    total_project: number
    total_project_amount: number
    fixed_deposit: number
    share_holder: number
    directorship: number
  }[]
}
