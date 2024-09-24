import { ILogin, IUser } from './user.interface'
import { UserModel } from './user.model'
import bcrypt from 'bcryptjs'
import { createToken } from '../../utils/jwt.utils'
import config from '../../config'
import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'

const registerUserIntoDB = async (userData: IUser) => {
  const existingUser = await UserModel.findOne({ email: userData.email })
  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this email already exists',
    )
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10)
  const user = new UserModel({ ...userData, password: hashedPassword })
  await user.save()
  return user
}

const loginUserFromDB = async ({ email, password }: ILogin) => {
  const user = await UserModel.findOne({ email })
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials')
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
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
