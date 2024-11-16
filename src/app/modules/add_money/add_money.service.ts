import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoney, IRequestAddMoney } from './add_money.interface'
import { AddMoneyModel, RequestAddMoneyModel } from './add_money.model'
import { UserModel } from '../user/user.model'
import {
  AddMoneyHistoryModel,
  MatchingBonusHistoryModel,
  ReferralBonusHistoryModel,
} from '../history-report/history_report.model'
import { Document, Types } from 'mongoose'
import { IUser } from '../user/user.interface'
import Queue from 'bull'
import { io, userSocketMap } from '../../../socket'
import { clearUserCache } from '../shared/utils'
import redisClient from '../../config/redis.config'
import { WalletService } from '../wallet/wallet.service'

const matchingBonusCalculation = async (
  parent_user_id: string | Types.ObjectId,
  date: string,
) => {
  const parent_user = await UserModel.findById(parent_user_id)

  if (!parent_user) {
    return
  }

  const left_side_user = await UserModel.findById(parent_user.left_side_partner)
  const right_side_user = await UserModel.findById(
    parent_user.right_side_partner,
  )

  if (!left_side_user || !right_side_user) {
    return
  }

  const carryThresholds = [
    { threshold: 5000000, bonusMultiplier: 0.07 },
    { threshold: 3000000, bonusMultiplier: 0.07 },
    { threshold: 2000000, bonusMultiplier: 0.07 },
    { threshold: 1500000, bonusMultiplier: 0.07 },
    { threshold: 1000000, bonusMultiplier: 0.07 },
    { threshold: 500000, bonusMultiplier: 0.07 },
    { threshold: 200000, bonusMultiplier: 0.07 },
    { threshold: 100000, bonusMultiplier: 0.07 },
    { threshold: 50000, bonusMultiplier: 0.07 },
  ]

  if (
    left_side_user.accountable.total_carry >= 50000 &&
    right_side_user.accountable.total_carry >= 50000
  ) {
    for (const { threshold, bonusMultiplier } of carryThresholds) {
      if (
        left_side_user.accountable.total_carry >= threshold &&
        right_side_user.accountable.total_carry >= threshold
      ) {
        left_side_user.accountable = {
          ...left_side_user.accountable,
          total_carry: left_side_user.accountable.total_carry - threshold,
        }

        right_side_user.accountable = {
          ...right_side_user.accountable,
          total_carry: right_side_user.accountable.total_carry - threshold,
        }

        parent_user.accountable = {
          ...parent_user.accountable,
          team_a_carry: left_side_user.accountable.total_carry,
          team_a_point: left_side_user.accountable.total_point,

          team_b_carry: right_side_user.accountable.total_carry,
          team_b_point: right_side_user.accountable.total_point,
        }

        if (
          left_side_user.accountable.total_carry <
          right_side_user.accountable.total_carry
        ) {
          left_side_user.accountable = {
            ...left_side_user.accountable,
            total_carry: 0,
          }
          parent_user.accountable = {
            ...parent_user.accountable,
            team_a_carry: 0,
          }
        } else {
          right_side_user.accountable = {
            ...right_side_user.accountable,
            total_carry: 0,
          }
          parent_user.accountable = {
            ...parent_user.accountable,
            team_b_carry: 0,
          }
        }

        await left_side_user.save()
        await right_side_user.save()
        await parent_user.save()

        // Update parent's wallet with matching bonus
        const matchingBonus = parseFloat(
          (threshold * bonusMultiplier).toFixed(2),
        )

        parent_user.wallet = {
          ...parent_user.wallet,
          income_wallet: parent_user.wallet.income_wallet + matchingBonus,
          matching_bonus: parent_user.wallet.matching_bonus + matchingBonus,
        }
        await parent_user.save()

        const currentMatchingBonus = {
          matching_bonus_amount: matchingBonus,
          type: 'Matching Bonus',
          date: date,
        }

        const userMatchingHistory = await MatchingBonusHistoryModel.findOne({
          userId: parent_user._id,
        })

        if (!userMatchingHistory) {
          const newMatchingRecord = await new MatchingBonusHistoryModel({
            userId: parent_user._id,
            total_matching_history:
              parent_user.wallet.matching_bonus + matchingBonus,
            matching_bonus_history: [currentMatchingBonus],
          }).save()
          await newMatchingRecord.save()
        } else {
          userMatchingHistory.total_matching_history += Number(
            currentMatchingBonus.matching_bonus_amount,
          )
          userMatchingHistory.matching_bonus_history.push(currentMatchingBonus)
          await userMatchingHistory.save()
        }

        await clearUserCache(left_side_user._id.toString())
        await clearUserCache(right_side_user._id.toString())
        await clearUserCache(parent_user._id.toString())

        break
      }
    }
  } else {
    parent_user.accountable = {
      ...parent_user.accountable,
      team_a_carry: left_side_user.accountable.total_carry,
      team_a_point: left_side_user.accountable.total_point,

      team_b_carry: right_side_user.accountable.total_carry,
      team_b_point: right_side_user.accountable.total_point,
    }

    await parent_user.save()

    await clearUserCache(parent_user._id.toString())
    await redisClient.del('all_users')
  }
}

const updateAllParentUserCalculation = async (
  parent_user_id: string | Types.ObjectId | object,
  new_total_point: number,
  date: string,
) => {
  const parent_user = await UserModel.findById(parent_user_id)
  if (!parent_user) return

  parent_user.accountable = {
    ...parent_user.accountable,
    total_point: parent_user.accountable.total_point + new_total_point,
    total_carry: parent_user.accountable.total_carry + new_total_point,
  }

  await parent_user.save()
  await clearUserCache(parent_user._id.toString())

  await matchingBonusCalculation(parent_user._id, date)

  if (parent_user.parent_placement_id) {
    await updateAllParentUserCalculation(
      parent_user.parent_placement_id,
      new_total_point,
      date,
    )
  }
}

const updateReferralWallet = async (
  referral_user: Document & IUser,
  currentAccountable: IAddMoney,
) => {
  const { total_amount } = currentAccountable

  // Calculate the 7% bonus for both fixed_deposit and share_holder
  const referral_bonus = total_amount * 0.07

  // Update the referral user's wallet
  referral_user.wallet = {
    ...referral_user.wallet,
    income_wallet: (referral_user.wallet.income_wallet || 0) + referral_bonus,
    reference_bonus:
      (referral_user.wallet.reference_bonus || 0) + referral_bonus,
  }

  const currentAccountableUser = await UserModel.findById(
    currentAccountable.userId,
  )
    .select('_id name user_name')
    .lean()

  const currentReferralBonus = {
    bonus_from: currentAccountableUser!.user_name,
    reference_bonus_amount: referral_bonus,
    type: 'Referral Bonus',
    date: currentAccountable.date,
  }

  const userReferralHistory = await ReferralBonusHistoryModel.findOne({
    userId: referral_user._id,
  })

  if (!userReferralHistory) {
    const newReferralRecord = await new ReferralBonusHistoryModel({
      userId: referral_user._id,
      total_referral_history: Number(referral_bonus).toFixed(2),
      referral_bonus_history: [currentReferralBonus],
    }).save()
    await newReferralRecord.save()
  } else {
    userReferralHistory.total_referral_history += Number(
      currentReferralBonus.reference_bonus_amount,
    )
    userReferralHistory.referral_bonus_history.push(currentReferralBonus)

    await userReferralHistory.save()
  }

  return referral_user
}

const createAddMoney = async (addMoneyData: IAddMoney) => {
  const { userId } = addMoneyData

  const user = await UserModel.findOne({
    _id: userId,
  })

  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const userAccountable = await AddMoneyModel.findOne({
    userId: userId,
  })

  const currentAccountable = {
    userId,
    project_share: addMoneyData.project_share,
    fixed_deposit: addMoneyData.fixed_deposit,
    share_holder: addMoneyData.share_holder,
    directorship: addMoneyData.directorship,
    total_amount: addMoneyData.total_amount,
    money_receipt_number: addMoneyData.money_receipt_number,
    phone: addMoneyData.phone,
    payment_method: addMoneyData.payment_method,
    bank_name: addMoneyData.bank_name,
    bank_account_name: addMoneyData.bank_account_name,
    branch_name: addMoneyData.branch_name,
    transaction_id: addMoneyData.transaction_id,
    payment_picture: addMoneyData.payment_picture,
    picture: addMoneyData.picture,
    is_approved: addMoneyData.is_approved,
    date: addMoneyData.date,
  }

  // After approve
  // Create add money history
  const currentAddMoneyHistory = await new AddMoneyHistoryModel(
    currentAccountable,
  ).save()

  // Update all parent user calculation
  await updateAllParentUserCalculation(
    user.parent_placement_id,
    addMoneyData.total_amount,
    addMoneyData.date,
  )

  const referral_user = await UserModel.findOne({
    _id: user.reference_id,
  })

  // Create share holder payment
  if (addMoneyData.share_holder > 0) {
    // Add one month to the date
    const paymentDate = new Date(addMoneyData.date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    await WalletService.createShareHolderPayment({
      userId: user._id,
      add_money_history_id: currentAddMoneyHistory._id as string,
      payment_method: addMoneyData.payment_method,
      money_receipt_number: addMoneyData.money_receipt_number,
      share_holder_amount: addMoneyData.share_holder,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  }

  // Create directorship payment
  if (addMoneyData.directorship > 0) {
    const paymentDate = new Date(addMoneyData.date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    await WalletService.createDirectorshipPayment({
      userId: user._id,
      add_money_history_id: currentAddMoneyHistory._id as string,
      payment_method: addMoneyData.payment_method,
      money_receipt_number: addMoneyData.money_receipt_number,
      directorship_amount: addMoneyData.directorship,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  }

  // After approve
  if (!userAccountable) {
    console.log('From if createAddMoney')
    const newAddMoneyRecord = new AddMoneyModel({
      ...currentAccountable,
    })

    // add final account balance data in user model
    if (user) {
      user.accountable = {
        ...user.accountable,
        project_share: currentAccountable.project_share,
        fixed_deposit: currentAccountable.fixed_deposit,
        share_holder: currentAccountable.share_holder,
        directorship: currentAccountable.directorship,
        total_amount: currentAccountable.total_amount,
      }
      await user.save()
      await clearUserCache(user._id.toString())
    }

    if (referral_user) {
      const updated_referral_user = await updateReferralWallet(
        referral_user as Document & IUser, // <-- Cast referral_user to Document & IUser
        currentAccountable,
      )

      await updated_referral_user.save()
      await clearUserCache(referral_user._id.toString())
    }

    return await newAddMoneyRecord.save()
  } else {
    console.log('From else createAddMoney')
    userAccountable.project_share += currentAccountable.project_share
    userAccountable.fixed_deposit += currentAccountable.fixed_deposit
    userAccountable.share_holder += currentAccountable.share_holder
    userAccountable.directorship += currentAccountable.directorship
    userAccountable.total_amount += currentAccountable.total_amount
    userAccountable.money_receipt_number =
      currentAccountable.money_receipt_number
    userAccountable.phone = currentAccountable.phone
    userAccountable.payment_method = currentAccountable.payment_method
    userAccountable.bank_name = currentAccountable.bank_name
    userAccountable.bank_account_name = currentAccountable.bank_account_name
    userAccountable.branch_name = currentAccountable.branch_name
    userAccountable.transaction_id = currentAccountable.transaction_id
    userAccountable.payment_picture = currentAccountable.payment_picture
    userAccountable.picture = currentAccountable.picture
    userAccountable.date = currentAccountable.date
    userAccountable.is_approved = currentAccountable.is_approved

    // add final account balance data in user model
    if (user) {
      user.accountable = {
        ...user.accountable,
        project_share: userAccountable.project_share,
        fixed_deposit: userAccountable.fixed_deposit,
        share_holder: userAccountable.share_holder,
        directorship: userAccountable.directorship,
        total_amount: userAccountable.total_amount,
      }

      await user.save()
      await clearUserCache(user._id.toString())
    }

    if (referral_user) {
      const updated_referral_user = await updateReferralWallet(
        referral_user as Document & IUser,
        currentAccountable,
      )

      await updated_referral_user.save()
      await clearUserCache(referral_user._id.toString())
    }

    // after add money to show all his add_money_history
    const userAddMoneyHistory = await AddMoneyHistoryModel.find({
      userId,
    })

    // Assign the mapped history to userAccountable.add_money_history
    userAccountable.add_money_history = userAddMoneyHistory
    return await userAccountable.save()
  }
}

const getRequestedAddMoney = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const requestedAddMoney = await RequestAddMoneyModel.find({
    is_approved: false,
  })
    .skip(skip)
    .limit(limit)

  const total = await RequestAddMoneyModel.countDocuments({})
  return { requestedAddMoney, total, page, limit }
}

const requestAddMoney = async (addMoneyData: IRequestAddMoney) => {
  const newAddMoneyRequest = new RequestAddMoneyModel({
    ...addMoneyData,
  })

  return await newAddMoneyRequest.save()
}

// const sendNotificationAfterMonth = (userId: string, socketId: string) => {
//   console.log('Scheduled notification to user after one month.')

//   // One month in milliseconds
//   // const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000
//   const oneMonthInMilliseconds = 1 * 60 * 1000

//   // Use setTimeout to delay the notification for one month
//   setTimeout(() => {
//     console.log('Sending notification to user after one month.')

//     // Emit the notification to the specific user
//     io.to(socketId).emit('notification', {
//       message: 'It’s time to add money again!',
//       userId: userId,
//     })
//   }, oneMonthInMilliseconds) // One month from now
// }

// With bull
const notificationQueue = new Queue('notificationQueue', {
  redis: {
    host: '127.0.0.1', // Update with Redis connection
    port: 6379,
  },
})

notificationQueue.process(async (job) => {
  const { userId, message } = job.data
  const socketId = userSocketMap.get(userId)
  if (socketId) {
    io.to(socketId).emit('notification', { message, userId })
  }
})

const scheduleNotificationJobs = (userId: string, startDate: Date) => {
  for (let i = 1; i <= 25; i++) {
    const nextDate = new Date(startDate)
    nextDate.setMonth(nextDate.getMonth() + i) // Increment by i months

    // Schedule a notification job for each month
    notificationQueue.add(
      {
        userId,
        message: `This is your month ${i} reminder to add money.`,
      },
      {
        delay: nextDate.getTime() - Date.now(), // Delay until the specific date
        attempts: 3, // Retry up to 3 times if it fails
      },
    )
  }
}

// Example usage inside approveAddMoney:
const approveAddMoney = async (requestAddMoneyId: string) => {
  await clearUserCache(requestAddMoneyId)

  const requestedAddMoneyData =
    await RequestAddMoneyModel.findById(requestAddMoneyId)

  if (!requestedAddMoneyData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Requested add money not found')
  }

  requestedAddMoneyData.is_approved = true
  await createAddMoney(requestedAddMoneyData)

  const user = await UserModel.findOne({ _id: requestedAddMoneyData.userId })

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const userId = user._id.toString()

  // Find the socket ID for this user from the userSocketMap
  const socketId = userSocketMap.get(userId)

  if (socketId) {
    io.to(socketId).emit('notification', {
      message: 'Your add money request has been approved.',
      userId: user._id,
      requestId: requestedAddMoneyData._id,
    })
  }

  // Schedule monthly notifications for the next 25 months
  scheduleNotificationJobs(userId, requestedAddMoneyData.createdAt!)

  return await requestedAddMoneyData.save()
}

export const AddMoneyServices = {
  createAddMoney,
  getRequestedAddMoney,
  requestAddMoney,
  approveAddMoney,
}
