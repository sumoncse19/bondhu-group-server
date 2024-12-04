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
import { WalletService } from '../wallet/wallet.service'
import { Roles } from '../shared/user.enumeration'
import { IAddMoneyHistory } from '../history-report/history_report.interface'

const matchingBonusCalculation = async (
  parent_user_id: string | Types.ObjectId,
  date: string,
) => {
  console.log('From matching bonus calculation')
  const parent_user = await UserModel.findById(parent_user_id)

  console.log(parent_user, 'check parent_user')
  if (!parent_user) {
    return
  }

  const left_side_user = await UserModel.findById(parent_user.left_side_partner)
  const right_side_user = await UserModel.findById(
    parent_user.right_side_partner,
  )

  console.log(
    left_side_user,
    'left_side_user',
    right_side_user,
    'right_side_user',
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

  console.log(
    left_side_user.accountable.total_carry,
    'left_side_user.accountable.total_carry',
    right_side_user.accountable.total_carry,
    'right_side_user.accountable.total_carry',
  )
  if (
    left_side_user.accountable.total_carry >= 50000 &&
    right_side_user.accountable.total_carry >= 50000
  ) {
    for (const { threshold, bonusMultiplier } of carryThresholds) {
      console.log(
        threshold,
        'threshold',
        left_side_user.accountable.total_carry,
        right_side_user.accountable.total_carry,
      )
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

        console.log('Before adding as club member', threshold)
        if (threshold >= 100000) {
          if (!parent_user.is_club_member) {
            parent_user.is_club_member = true
            parent_user.club_joining_date = new Date().toISOString()
            const super_admin = await UserModel.findOne({
              role: Roles.SUPER_ADMIN,
            })

            if (super_admin) {
              super_admin.total_club_member =
                (super_admin.total_club_member || 0) + 1
              await super_admin.save()
            }
          } else {
            parent_user.last_one_lac_matching_date = new Date().toISOString()
          }
        }

        console.log('After club bonus calculation', threshold)

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

        break
      }
    }
  } else {
    console.log('Before update parent user calculation from else')
    parent_user.accountable = {
      ...parent_user.accountable,
      team_a_carry: left_side_user.accountable.total_carry,
      team_a_point: left_side_user.accountable.total_point,

      team_b_carry: right_side_user.accountable.total_carry,
      team_b_point: right_side_user.accountable.total_point,
    }

    await parent_user.save()
  }
}

const updateAllParentUserCalculation = async (
  parent_user_id: string | Types.ObjectId | object,
  new_total_point: number,
  date: string,
) => {
  if (parent_user_id !== '') {
    const parent_user = await UserModel.findById(parent_user_id)
    if (!parent_user) return

    parent_user.accountable = {
      ...parent_user.accountable,
      total_point: parent_user.accountable.total_point + new_total_point,
      total_carry: parent_user.accountable.total_carry + new_total_point,
    }

    await parent_user.save()

    await matchingBonusCalculation(parent_user._id, date)

    if (parent_user.parent_placement_id) {
      await updateAllParentUserCalculation(
        parent_user.parent_placement_id,
        new_total_point,
        date,
      )
    }
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

const createWalletPayment = async (
  user: Document & IUser,
  addMoneyData: IAddMoney,
  currentAddMoneyHistory: Document & IAddMoneyHistory,
) => {
  // Create project share payment
  if (addMoneyData.project_share > 0) {
    const paymentDate = new Date(addMoneyData.date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    await WalletService.createProjectSharePayment({
      userId: user._id,
      name: user.name,
      user_name: user.user_name,
      add_money_history_id: currentAddMoneyHistory._id as string,
      payment_method: addMoneyData.payment_method,
      money_receipt_number: addMoneyData.money_receipt_number,
      project_share_amount: addMoneyData.project_share,
      profit_amount: 0,
      payment_count: 1,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  }

  // Create fixed deposit payment
  if (addMoneyData.fixed_deposit > 0) {
    const paymentDate = new Date(addMoneyData.date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    await WalletService.createFixedDepositPayment({
      userId: user._id,
      name: user.name,
      user_name: user.user_name,
      add_money_history_id: currentAddMoneyHistory._id as string,
      payment_method: addMoneyData.payment_method,
      money_receipt_number: addMoneyData.money_receipt_number,
      fixed_deposit_amount: addMoneyData.fixed_deposit,
      profit_amount: 0,
      payment_count: 1,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  }

  // Create share holder payment
  if (addMoneyData.share_holder > 0) {
    // Add one month to the date
    const paymentDate = new Date(addMoneyData.date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    await WalletService.createShareHolderPayment({
      userId: user._id,
      name: user.name,
      user_name: user.user_name,
      add_money_history_id: currentAddMoneyHistory._id as string,
      payment_method: addMoneyData.payment_method,
      money_receipt_number: addMoneyData.money_receipt_number,
      share_holder_amount: addMoneyData.share_holder,
      profit_amount: 0,
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
      name: user.name,
      user_name: user.user_name,
      add_money_history_id: currentAddMoneyHistory._id as string,
      payment_method: addMoneyData.payment_method,
      money_receipt_number: addMoneyData.money_receipt_number,
      directorship_amount: addMoneyData.directorship,
      profit_amount: 0,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  }

  console.log('Done create wallet payment')
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
    account_no: addMoneyData.account_no,
    transaction_id: addMoneyData.transaction_id,
    payment_picture: addMoneyData.payment_picture,
    picture: addMoneyData.picture,
    is_reject: addMoneyData.is_reject,
    is_approved: addMoneyData.is_approved,
    date: addMoneyData.date,
  }

  // After approve
  // Create add money history
  const currentAddMoneyHistory = await new AddMoneyHistoryModel(
    currentAccountable,
  ).save()

  await createWalletPayment(user, addMoneyData, currentAddMoneyHistory)

  // Update all parent user calculation
  console.log('Before update all parent user calculation', addMoneyData, user)
  await updateAllParentUserCalculation(
    user.parent_placement_id,
    addMoneyData.total_amount,
    addMoneyData.date,
  )
  let referral_user
  if (user.reference_id !== '') {
    referral_user = await UserModel.findOne({
      _id: user.reference_id,
    })
  }

  // After approve
  if (!userAccountable) {
    const newAddMoneyRecord = new AddMoneyModel({
      ...currentAccountable,
    })

    newAddMoneyRecord.add_money_history = [currentAccountable]

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
    }

    if (referral_user) {
      const updated_referral_user = await updateReferralWallet(
        referral_user as Document & IUser, // <-- Cast referral_user to Document & IUser
        currentAccountable,
      )

      await updated_referral_user.save()
    }

    return await newAddMoneyRecord.save()
  } else {
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
    userAccountable.account_no = currentAccountable.account_no
    userAccountable.transaction_id = currentAccountable.transaction_id
    userAccountable.payment_picture = currentAccountable.payment_picture
    userAccountable.picture = currentAccountable.picture
    userAccountable.date = currentAccountable.date
    userAccountable.is_reject = currentAccountable.is_reject
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
    }

    if (referral_user) {
      const updated_referral_user = await updateReferralWallet(
        referral_user as Document & IUser,
        currentAccountable,
      )

      await updated_referral_user.save()
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
  const { userId } = addMoneyData
  const user = await UserModel.findById(userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const newAddMoneyRequest = new RequestAddMoneyModel({
    ...addMoneyData,
    name: user.name,
    user_name: user.user_name,
  })

  return await newAddMoneyRequest.save()
}

// Example usage inside approveAddMoney:
const approveAddMoney = async (requestAddMoneyId: string) => {
  const requestedAddMoneyData =
    await RequestAddMoneyModel.findById(requestAddMoneyId)

  if (!requestedAddMoneyData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Requested add money not found')
  }

  requestedAddMoneyData.is_approved = true
  await createAddMoney(requestedAddMoneyData)

  console.log('After approve add money')

  const user = await UserModel.findOne({ _id: requestedAddMoneyData.userId })
  console.log(user, 'user')
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  return await requestedAddMoneyData.save()
}

const rejectAddMoney = async (requestAddMoneyId: string) => {
  const requestedAddMoneyData =
    await RequestAddMoneyModel.findById(requestAddMoneyId)

  if (!requestedAddMoneyData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Requested add money not found')
  }

  requestedAddMoneyData.is_reject = true
  requestedAddMoneyData.is_approved = false

  return await requestedAddMoneyData.save()
}

const sendClubBonus = async (date: string) => {
  const clubBonusDate = new Date(date)

  console.log(clubBonusDate, 'clubBonusDate')

  const addMoneyHistories = await AddMoneyHistoryModel.find({})

  console.log(addMoneyHistories, 'addMoneyHistories')
}

export const AddMoneyServices = {
  createAddMoney,
  getRequestedAddMoney,
  requestAddMoney,
  approveAddMoney,
  rejectAddMoney,
  sendClubBonus,
}
