import { ILogin, IUser } from './user.interface'
import { UserModel } from './user.model'
import bcrypt from 'bcryptjs'
import { createToken } from '../../utils/jwt.utils'
import config from '../../config'
import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { PurchaseMoneyModel } from '../purchase/purchase.model'
import { TeamServices } from '../team/team.service'
import mongoose from 'mongoose'

const registerUserIntoDB = async (userData: IUser) => {
  if (userData.role !== 'superAdmin') {
    const joinerId = userData.agent_id

    if (joinerId && joinerId !== '') {
      const joinerUser = await UserModel.findOne({
        _id: joinerId,
      })

      if (
        !joinerUser?.wallet?.purchase_wallet ||
        joinerUser?.wallet?.purchase_wallet < 1000
      ) {
        throw new AppError(
          httpStatus.CONFLICT,
          `You can't add an user because your purchase wallet amount is less than 1000`,
        )
      }
    } else {
      throw new AppError(
        httpStatus.CONFLICT,
        `Agent id is required and can't be empty`,
      )
    }
  }

  const existingSerialNumber = await UserModel.findOne({
    serial_number: userData.serial_number,
  })
  const existingUserName = await UserModel.findOne({
    user_name: userData.user_name,
  })
  const existingUserPhone = await UserModel.findOne({
    phone: userData.phone,
  })
  const existingUserPassport = await UserModel.findOne({
    nid_passport_no: userData.nid_passport_no,
  })

  if (existingSerialNumber) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this SERIAL NUMBER already exists',
    )
  }
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
    userData.password ? userData.password : 'bgbd123456',
    10,
  )
  const user = new UserModel({
    ...userData,
    password: hashedPassword,
  })

  user.placement_id = user._id.toString()

  if (user.role !== 'superAdmin') {
    const allChildUserOfThisReferenceUser =
      await TeamServices.getAllChildUsersFromDB(userData.reference_id)

    // Check if userData.parent_placement_id is one of the child users' _id
    const isValidParentPlacement = allChildUserOfThisReferenceUser.some(
      (childUser) =>
        childUser._id.toString() === userData.parent_placement_id.toString(),
    )

    // If not, throw an error
    if (!isValidParentPlacement) {
      throw new AppError(
        httpStatus.CONFLICT,
        'The provided parent placement ID does not belong to any child of the reference user.',
      )
    }

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
        ...user.wallet,
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
    userId: userData.agent_id?.toString(),
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
      partner_serial_number: user.serial_number,
      partner_name: user.name,
      partner_user_name: user.user_name,
      date: new Date().toString(),
    })
    if (referralPurchase?.purchase_amount) {
      referralPurchase.purchase_amount =
        referralPurchase?.purchase_amount - 1000

      const referralUser = await UserModel.findOne({
        _id: userData.agent_id?.toString(),
      })

      if (!referralUser) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Referral user not found',
        )
      } else {
        referralUser.wallet = {
          ...referralUser.wallet,
          purchase_wallet: referralPurchase.purchase_amount,
        }
        // referralUser.wallet.purchase_wallet = referralPurchase.purchase_amount
        // referralUser.markModified('wallet')
        await referralUser.save()
      }
    }
    await referralPurchase?.save()
  }

  await user.save()

  // Clear cached users list after new registration
  // await redisClient.del(`user:${user.agent_id || ''}`)
  // await redisClient.del(`user:${user.reference_id}`)
  // await redisClient.del(`user:${user.parent_placement_id}`)
  // await redisClient.del('all_users')

  return user
}

const updateUserInDB = async (userId: string, updateData: Partial<IUser>) => {
  const user = await UserModel.findById(userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  Object.assign(user, updateData)

  if (updateData.password) {
    user.password = await bcrypt.hash(updateData.password, 10)
  }

  await user.save()

  // Clear cached user data after update
  // await clearUserCache(userId)

  return user
}

const updateNecessaryRequiredFieldIntoDB = async () => {
  // const result = await UserModel.updateMany(
  //   {
  //     last_one_lac_matching_date: { $exists: false },
  //   },
  //   {
  //     $set: { last_one_lac_matching_date: '' },
  //   },
  // )

  const result = await UserModel.updateMany(
    {
      $or: [{ is_club_member: { $exists: false } }],
    },
    { $set: { is_club_member: false } },
  )

  return result
}

const loginUserFromDB = async ({ user_name, password }: ILogin) => {
  const user = await UserModel.findOne({ user_name })
    .select(
      '_id name user_name password role phone designation reference_id wallet is_approved',
    )
    .lean()

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

  const isApproved = user?.is_approved
  if (!isApproved) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Your account is not approved yet.',
    )
  }

  const jwtPayload = {
    userId: user._id.toString(),
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

  delete user.password

  return {
    accessToken,
    refreshToken,
    user,
  }
}

const getUserFromDB = async (userId: string) => {
  const isValidObjectId = (id: string | object | null): boolean => {
    if (!id) return false
    return mongoose.Types.ObjectId.isValid(id.toString())
  }

  const user = await UserModel.findById(userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  if (user.left_side_partner && isValidObjectId(user.left_side_partner)) {
    const leftPartner = await UserModel.findById(user.left_side_partner)
      .select('_id name user_name role phone cover_photo')
      .lean()

    if (leftPartner === null) {
      user.left_side_partner = null
      await user.save()
    }
  } else if (user.left_side_partner !== null) {
    user.left_side_partner = null
    await user.save()
  }

  if (user.right_side_partner && isValidObjectId(user.right_side_partner)) {
    const rightPartner = await UserModel.findById(user.right_side_partner)
      .select('_id name user_name role phone cover_photo')
      .lean()

    if (rightPartner === null) {
      user.right_side_partner = null
      await user.save()
    }
  } else if (user.right_side_partner !== null) {
    user.right_side_partner = null
    await user.save()
  }

  if (user && user.role !== 'superAdmin') {
    const referrer = await UserModel.findById(user.reference_id)
      .select('_id name user_name role phone cover_photo')
      .lean()
    user.reference_id = referrer || ''
    const parent_user = await UserModel.findById(user.parent_placement_id)
      .select('_id name user_name role phone cover_photo')
      .lean()
    user.parent_placement_id = parent_user || ''
  }
  return user
}

const getAllUserFromDB = async (
  page: number,
  limit: number,
  search: string,
  is_club_member: boolean | undefined,
) => {
  const skip = (page - 1) * limit

  const searchCondition = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { user_name: { $regex: search, $options: 'i' } },
          { serial_number: { $regex: search, $options: 'i' } },
        ],
      }
    : {}

  const query = {
    ...searchCondition,
    ...(typeof is_club_member === 'boolean' && { is_club_member }),
  }

  const users = await UserModel.find(query)
    .sort({ _id: -1 })
    .select(
      '_id name user_name serial_number email role designation phone reference_id parent_placement_id left_side_partner right_side_partner registration_date picture wallet nid_passport_no choice_side is_club_member club_joining_date last_one_lac_matching_date nominee_name is_approved',
    )
    .skip(skip)
    .limit(limit)

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

      if (user && user.role !== 'superAdmin') {
        const referrer = await UserModel.findById(user.reference_id)
          .select('_id name user_name role phone')
          .lean()
        user.reference_id = referrer || ''

        const parent_user = await UserModel.findById(user.parent_placement_id)
          .select('_id name user_name role phone')
          .lean()
        user.parent_placement_id = parent_user || ''
      }

      return user
    }),
  )

  const total = await UserModel.countDocuments(query)
  return { usersWithPartners, total, page, limit }
}

const getAllUserNameFromDB = async () => {
  const users = await UserModel.find({}).select('_id name user_name')
  return users
}

const getAllReferredUserFromDB = async (userId: string) => {
  const referredUsers = await UserModel.find({ reference_id: userId })
    .select(
      '_id name user_name role phone reference_id parent_placement_id wallet accountable left_side_partner right_side_partner registration_date is_approved',
    )
    .lean()

  return referredUsers
}

export const UserServices = {
  registerUserIntoDB,
  updateUserInDB,
  updateNecessaryRequiredFieldIntoDB,
  loginUserFromDB,
  getUserFromDB,
  getAllUserFromDB,
  getAllUserNameFromDB,
  getAllReferredUserFromDB,
}
