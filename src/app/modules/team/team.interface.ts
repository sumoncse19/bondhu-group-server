import { Types } from 'mongoose'

export interface ITeamMember {
  _id: Types.ObjectId | string
  name: string
  user_name: string
  phone: string
  picture: string | undefined
  email: string
  reference_id: Types.ObjectId | string
  parent_placement_id: Types.ObjectId | string
  wallet: object
  accountable: object
  left_side_partner?: ITeamMember | string | object | null
  right_side_partner?: ITeamMember | string | object | null
  registration_date: string
}

// Root level interface for the team data
export interface ITeam {
  _id: Types.ObjectId | string
  name: string
  user_name: string
  phone: string
  picture: string | undefined
  email: string
  reference_id: Types.ObjectId | string
  parent_placement_id: Types.ObjectId | string
  wallet: object
  accountable: object
  left_side_partner?: ITeamMember | string | object | null
  right_side_partner?: ITeamMember | string | object | null
  registration_date: string
}
