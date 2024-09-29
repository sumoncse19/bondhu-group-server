import { ILogin, IUser } from './user.interface'
import { UserModel } from './user.model'
import bcrypt from 'bcryptjs'
import { createToken } from '../../utils/jwt.utils'
import config from '../../config'
import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'

const registerUserIntoDB = async (userData: IUser) => {
  const existingUserName = await UserModel.findOne({
    user_name: userData.user_name,
  })
  const existingUserPhone = await UserModel.findOne({
    phone: userData.phone,
  })
  const existingUserPassport = await UserModel.findOne({
    nid_passport_no: userData.nid_passport_no,
  })

  if (existingUserName) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this USERNAME already exists',
    )
  }
  if (existingUserPhone) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this PHONE already exists',
    )
  }
  if (existingUserPassport) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this NID or PASSPORT already exists',
    )
  }

  const hashedPassword = await bcrypt.hash(
    userData.password ? userData.password : 'bondhuGroup123456',
    10,
  )
  const user = new UserModel({
    ...userData,
    password: hashedPassword,
  })

  user.placement_id = user._id.toString()

  if (user.role !== 'superAdmin') {
    if (user.choice_side === 'a') {
      const parentUser = await UserModel.findOne({
        _id: userData.parent_placement_id,
      })
      if (parentUser) {
        if (parentUser.left_side_partner) {
          throw new AppError(
            httpStatus.CONFLICT,
            'A partner is already placed on the left side',
          )
        } else {
          parentUser.left_side_partner = user._id.toString()
          await parentUser.save()
        }
      }
    } else if (user.choice_side === 'b') {
      const parentUser = await UserModel.findOne({
        _id: userData.parent_placement_id,
      })
      if (parentUser) {
        if (parentUser.right_side_partner) {
          throw new AppError(
            httpStatus.CONFLICT,
            'A partner is already placed on the right side',
          )
        } else {
          parentUser.right_side_partner = user._id.toString()
          await parentUser.save()
        }
      }
    }
  }

  user.left_side_partner =
    user.left_side_partner === '' ? null : user.left_side_partner
  user.right_side_partner =
    user.right_side_partner === '' ? null : user.right_side_partner

  await user.save()
  return user
}

const loginUserFromDB = async ({ user_name, password }: ILogin) => {
  const user = await UserModel.findOne({ user_name })
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!)
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials')
  }

  const jwtPayload = {
    userId: user.id,
    user_name: user.user_name,
    role: user.role,
  }
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  )

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  )
  return {
    accessToken,
    refreshToken,
    user,
  }
}

export const UserServices = {
  registerUserIntoDB,
  loginUserFromDB,
}
