import { Request, Response } from 'express'
import { SUCCESS, SUCCESS_LOGIN } from '../shared/api.response.types'
import { UserServices } from './user.service'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
// import { clearUserCache } from '../shared/utils'

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

  return SUCCESS(res, httpStatus.OK, 'User updated successfully', updatedUser)
})

const updateNecessaryRequiredFieldIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    await UserServices.updateNecessaryRequiredFieldIntoDB()
    return SUCCESS(
      res,
      httpStatus.OK,
      'Necessary required field updated successfully',
    )
  },
)

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
  const page = (req.query.page as string) || '1'
  const limit = (req.query.limit as string) || '10'
  const search = (req.query.search as string) || ''
  const is_club_member = req.query.is_club_member === 'true' ? true : false

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)

  const users = await UserServices.getAllUserFromDB(
    pageNum,
    limitNum,
    search,
    is_club_member,
  )

  return SUCCESS(res, httpStatus.OK, 'Get all users successfully', users)
})

const getAllUserName = catchAsync(async (req: Request, res: Response) => {
  const users = await UserServices.getAllUserNameFromDB()
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
  updateNecessaryRequiredFieldIntoDB,
  loginUser,
  getUser,
  getAllUser,
  getAllUserName,
  getAllReferredUser,
}
