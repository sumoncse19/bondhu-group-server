import { Types } from 'mongoose'
import { Email } from '../shared/common.types'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

export interface ILogin {
  user_name: string
  password: string
}

export interface IUserWallet {
  income_wallet?: number
  reference_bonus?: number
  matching_bonus?: number
  purchase_wallet?: number
}

export interface IUserAccountable {
  project_share?: number
  fixed_deposit?: number
  share_holder?: number
  directorship?: number
  total_amount?: number
  total_point?: number
  total_carry?: number
}

export interface IUser extends Omit<ILogin, 'password'> {
  // export interface IUser extends ILogin {
  name: string
  email: Email
  registration_date: string
  password?: string
  father_or_husband_name?: string
  mother_name?: string
  picture?: string
  cover_photo?: string
  phone: string
  role: Roles
  present_address?: string
  permanent_address?: string
  nationality?: string
  religion?: string
  blood_group?: string
  nid_passport_no: string
  dob: string
  choice_side: Sides
  marital_status?: MaritalStatus
  profession?: string
  reference_id: Types.ObjectId | string
  parent_placement_id: Types.ObjectId | string
  placement_id: string
  left_side_partner: string | object | null
  right_side_partner: string | object | null
  accountable: IUserAccountable
  wallet: IUserWallet
  bKash?: string
  rocket?: string
  nagad?: string
  bank_name?: string
  account_no?: string
  routing_no?: string
  branch_name?: string
  swift_code?: string
  designation?: string
  nominee_name: string
  relation_with_nominee?: string
  nominee_address?: string
  nominee_mobile_no?: string
  nominee_picture?: string
  is_approved: boolean
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
