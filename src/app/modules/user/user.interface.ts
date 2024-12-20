import { Types } from 'mongoose'
import { Email } from '../shared/common.types'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

export interface ILogin {
  user_name: string
  password: string
}

export interface IUserWallet {
  purchase_wallet: number

  income_wallet: number
  reference_bonus: number
  matching_bonus: number
  club_bonus: number

  project_share_wallet: number
  fixed_deposit_wallet: number

  share_holder_wallet: number
  directorship_wallet: number
}

export interface IUserAccountable {
  project_share: number
  fixed_deposit: number
  share_holder: number
  directorship: number
  total_amount: number
  team_a_member: number
  team_b_member: number
  team_a_point: number
  team_b_point: number
  total_point: number
  team_a_carry: number
  team_b_carry: number
  total_carry: number
}

export interface IUser extends Omit<ILogin, 'password'> {
  // export interface IUser extends ILogin {
  _id: Types.ObjectId | string
  name: string
  serial_number: string
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
  dob?: string
  choice_side: Sides
  marital_status?: MaritalStatus
  profession?: string
  agent_id?: Types.ObjectId | string | object
  reference_id: Types.ObjectId | string | object
  parent_placement_id: Types.ObjectId | string | object
  placement_id: string
  left_side_partner: Types.ObjectId | string | object | null
  right_side_partner: Types.ObjectId | string | object | null
  accountable: IUserAccountable
  wallet: IUserWallet
  bKash?: string
  rocket?: string
  nagad?: string
  bank_name?: string
  bank_account_name?: string
  branch_name?: string
  account_no?: string
  routing_no?: string
  swift_code?: string
  security_code: string
  designation: string
  nominee_name: string
  relation_with_nominee?: string
  nominee_address?: string
  nominee_mobile_no?: string
  nominee_picture?: string
  note?: string
  note_image?: string
  is_approved: boolean
  is_club_member: boolean
  club_joining_date: string
  last_one_lac_matching_date: string
  total_club_member?: number
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
