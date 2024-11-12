import { Request, Response } from 'express'
import { SUCCESS, SUCCESS_LOGIN } from '../shared/api.response.types'
import { UserServices } from './user.service'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import redisClient from '../../config/redis.config'

// Add a helper function for clearing cache
const clearUserCache = async (userId: string) => {
  await redisClient.del(`user:${userId}`)
  await redisClient.del('all_users')
}

const registerUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = await UserServices.registerUserIntoDB(req.body)
    return SUCCESS(res, httpStatus.OK, 'User registered successfully', user)
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to register User',
)

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const updateData = req.body

  const updatedUser = await UserServices.updateUserInDB(userId, updateData)

  // Clear cache after update
  await clearUserCache(userId)

  return SUCCESS(res, httpStatus.OK, 'User updated successfully', updatedUser)
})

const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = await UserServices.loginUserFromDB(req.body)
    SUCCESS_LOGIN(
      res,
      httpStatus.OK,
      'User logged in successfully',
      user.accessToken,
      user.refreshToken,
      user.user,
    )
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to log in User',
)

const getUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const users = await UserServices.getUserFromDB(userId)

  return SUCCESS(res, httpStatus.OK, 'Get user successfully', users)
})

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const users = await UserServices.getAllUserFromDB()

  return SUCCESS(res, httpStatus.OK, 'Get all users successfully', users)
})

const getAllReferredUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const users = await UserServices.getAllReferredUserFromDB(userId)

  return SUCCESS(
    res,
    httpStatus.OK,
    'Get your referred user successfully',
    users,
  )
})

export const UserControllers = {
  registerUser,
  updateUser,
  loginUser,
  getUser,
  getAllUser,
  getAllReferredUser,
}
