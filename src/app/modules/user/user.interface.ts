import { Types } from 'mongoose'
import { Email } from '../shared/common.types'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

export interface ILogin {
  user_name: string
  password: string
}

export interface IWallet {
  purchase_wallet: number
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
  accountable: object
  wallet: IWallet
  nominee_name: string
  relation_with_nominee?: string
  nominee_address?: string
  nominee_mobile_no?: string
  nominee_picture?: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
