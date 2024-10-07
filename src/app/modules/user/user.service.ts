import { ILogin, IUser } from './user.interface'
import { UserModel } from './user.model'
import bcrypt from 'bcryptjs'
import { createToken } from '../../utils/jwt.utils'
import config from '../../config'
import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { PurchaseMoneyModel } from '../purchase/purchase.model'

const registerUserIntoDB = async (userData: IUser) => {
  if (userData.role !== 'superAdmin') {
    const referralUser = await UserModel.findOne({
      _id: userData.reference_id,
    })

    if (
      !referralUser?.wallet?.purchase_wallet ||
      referralUser?.wallet?.purchase_wallet < 1000
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `You can't add an user because your purchase wallet amount is less than 1000`,
      )
    }
  }

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
  } else {
    const newPurchaseRecord = new PurchaseMoneyModel({
      userId: user._id.toString(),
      purchase_amount: 100000,
      purchase_amount_history: [
        {
          purchase_from: user._id,
          purchase_amount: 100000,
          date: new Date().toString(),
        },
      ],
    })
    if (user) {
      user.wallet = {
        purchase_wallet: 100000,
      }
    }
    await newPurchaseRecord.save()
  }

  user.left_side_partner =
    user.left_side_partner === '' ? null : user.left_side_partner
  user.right_side_partner =
    user.right_side_partner === '' ? null : user.right_side_partner

  const referralPurchase = await PurchaseMoneyModel.findOne({
    userId: userData.reference_id.toString(),
  })

  if (!referralPurchase && user.role !== 'superAdmin') {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Purchase wallet of referral id didn't match`,
    )
  }

  if (user.role !== 'superAdmin') {
    referralPurchase?.joining_cost_history.push({
      new_partner_id: user._id.toString(),
      date: new Date().toString(),
    })
    if (referralPurchase?.purchase_amount) {
      referralPurchase.purchase_amount =
        referralPurchase?.purchase_amount - 1000

      const referralUser = await UserModel.findOne({
        _id: userData.reference_id,
      })

      if (!referralUser) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Referral user not found',
        )
      }

      referralUser.wallet = {
        purchase_wallet: referralPurchase.purchase_amount,
      }
      await referralUser.save()
    }
    referralPurchase?.save()
  }

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

const getUserFromDB = async (userId: string) => {
  const users = await UserModel.findById(userId)

  return users
}

const getAllUserFromDB = async () => {
  const users = await UserModel.find({})
    .select(
      '_id name user_name role phone reference_id parent_placement_id wallet accountable left_side_partner right_side_partner',
    )
    .lean()

  const usersWithPartners = await Promise.all(
    users.map(async (user) => {
      const { left_side_partner, right_side_partner } = user

      if (left_side_partner && left_side_partner !== '') {
        const leftPartner = await UserModel.findById(left_side_partner)
          .select('_id name user_name role phone')
          .lean()
        user.left_side_partner = leftPartner || null
      }

      if (right_side_partner && right_side_partner !== '') {
        const rightPartner = await UserModel.findById(right_side_partner)
          .select('_id name user_name role phone')
          .lean()
        user.right_side_partner = rightPartner || null
      }

      return user
    }),
  )

  return usersWithPartners
}

const getAllReferredUserFromDB = async (userId: string) => {
  const referredUsers = await UserModel.find({ reference_id: userId })
    .select(
      '_id name user_name role phone reference_id parent_placement_id wallet accountable left_side_partner right_side_partner',
    )
    .lean()

  return referredUsers
}

export const UserServices = {
  registerUserIntoDB,
  loginUserFromDB,
  getUserFromDB,
  getAllUserFromDB,
  getAllReferredUserFromDB,
}
