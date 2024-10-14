import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoney } from './add_money.interface'
import { AddMoneyModel } from './add_money.model'
import { UserModel } from '../user/user.model'
import {
  AddMoneyHistoryModel,
  ReferralBonusHistoryModel,
} from '../history-report/history_report.model'
import { Document, Types } from 'mongoose'
import { IUser } from '../user/user.interface'

const matchingBonusCalculation = async (
  parent_user_id: string | Types.ObjectId,
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

        // Update parent's wallet with matching bonus
        const matchingBonus = parseFloat(
          (
            parent_user.wallet.matching_bonus +
            threshold * bonusMultiplier
          ).toFixed(2),
        )

        parent_user.wallet = {
          ...parent_user.wallet,
          matching_bonus: matchingBonus,
          income_wallet:
            parseFloat(parent_user.wallet.income_wallet.toFixed(2)) +
            matchingBonus,
        }

        await parent_user.save()

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
  }
}

const updateAllParentUserCalculation = async (
  parent_user_id: string | Types.ObjectId,
  new_total_point: number,
) => {
  const parent_user = await UserModel.findById(parent_user_id)

  if (parent_user) {
    parent_user.accountable = {
      ...parent_user.accountable,
      total_point: parent_user.accountable.total_point + new_total_point,
      total_carry: parent_user.accountable.total_carry + new_total_point,
    }

    await parent_user.save()

    await matchingBonusCalculation(parent_user._id)

    if (parent_user.parent_placement_id) {
      await updateAllParentUserCalculation(
        parent_user.parent_placement_id,
        new_total_point,
      )
    }
  }
}

const updateReferralWallet = async (
  referral_user: Document & IUser,
  currentAccountable: IAddMoney,
) => {
  const { project_share, fixed_deposit, share_holder, directorship } =
    currentAccountable

  // Calculate the 7% bonus for both fixed_deposit and share_holder
  const referral_bonus =
    (project_share + fixed_deposit + share_holder + directorship) * 0.07

  // Update the referral user's wallet
  referral_user.wallet = {
    ...referral_user.wallet,
    income_wallet: (referral_user.wallet.income_wallet || 0) + referral_bonus,
    reference_bonus:
      (referral_user.wallet.reference_bonus || 0) + referral_bonus,
  }

  const currentReferralBonus = {
    bonus_from: currentAccountable.userId,
    reference_bonus_amount: referral_bonus,
    type: 'Referral Bonus',
    date: new Date().toString(),
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

  const referral_user = await UserModel.findOne({
    _id: user.reference_id,
  })

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
    is_approved: false,
    date: new Date().toString(),
  }

  await new AddMoneyHistoryModel(currentAccountable).save()

  if (user.parent_placement_id)
    await updateAllParentUserCalculation(
      user.parent_placement_id,
      addMoneyData.total_amount,
    )

  if (!userAccountable) {
    const newAddMoneyRecord = new AddMoneyModel({
      ...currentAccountable,
      // If we don't want to show the add_money_history in user --> then we have to remove this line
      add_money_history: [currentAccountable],
    })

    // add final account balance data in user model
    if (user) {
      user.accountable = {
        ...user.accountable,
        ...currentAccountable,
      }
      await user.save()
    }

    if (
      currentAccountable.fixed_deposit > 0 ||
      currentAccountable.share_holder > 0
    ) {
      if (referral_user) {
        const updated_referral_user = await updateReferralWallet(
          referral_user as Document & IUser, // <-- Cast referral_user to Document & IUser
          currentAccountable,
        )

        await updated_referral_user.save()
      }
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
    userAccountable.transaction_id = currentAccountable.transaction_id
    userAccountable.payment_picture = currentAccountable.payment_picture
    userAccountable.picture = currentAccountable.picture
    userAccountable.is_approved = currentAccountable.is_approved
    userAccountable.date = new Date().toString()

    // add final account balance data in user model
    if (user) {
      user.accountable = {
        ...user.accountable,
        ...userAccountable,
      }
      await user.save()
    }

    if (
      currentAccountable.fixed_deposit > 0 ||
      currentAccountable.share_holder > 0
    ) {
      if (referral_user) {
        const updated_referral_user = await updateReferralWallet(
          referral_user as Document & IUser,
          currentAccountable,
        )

        await updated_referral_user.save()
      }
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

export const AddMoneyServices = {
  createAddMoney,
}
