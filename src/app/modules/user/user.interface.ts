import { Email } from '../shared/common.types'
import { Roles } from '../shared/user.enumeration'

export interface ILogin {
  email: Email
  password: string
}

export interface IUser extends ILogin {
  name: string
  phone: string
  role: Roles
  address: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
