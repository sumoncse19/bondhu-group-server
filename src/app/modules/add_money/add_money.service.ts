import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoney } from './add_money.interface'
import { AddMoneyModel } from './add_money.model'
import { UserModel } from '../user/user.model'
import {
  AddMoneyHistoryModel,
  ReferralBonusHistoryModel,
} from '../history-report/history_report.model'
import { Document } from 'mongoose'
import { IUser } from '../user/user.interface'

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
    purchase_wallet: referral_user.wallet.purchase_wallet, // retain the same purchase wallet
    reference_bonus:
      (referral_user.wallet.reference_bonus || 0) + referral_bonus, // add 7% bonus to the existing value
    income_wallet: (referral_user.wallet.income_wallet || 0) + referral_bonus, // add 7% to income wallet
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
      total_referral_history: Number(referral_bonus),
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
    picture: addMoneyData.picture,
    date: new Date().toString(),
  }

  await new AddMoneyHistoryModel(currentAccountable).save()

  if (!userAccountable) {
    const newAddMoneyRecord = new AddMoneyModel({
      ...currentAccountable,
      add_money_history: [currentAccountable],
    })

    // add final account balance data in user model
    if (user) {
      user.accountable = {
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
    userAccountable.total_point = userAccountable.total_amount
    userAccountable.money_receipt_number =
      currentAccountable.money_receipt_number
    userAccountable.phone = currentAccountable.phone
    userAccountable.payment_method = currentAccountable.payment_method
    userAccountable.bank_name = currentAccountable.bank_name
    userAccountable.bank_account_name = currentAccountable.bank_account_name
    userAccountable.branch_name = currentAccountable.branch_name
    userAccountable.transaction_id = currentAccountable.transaction_id
    userAccountable.picture = currentAccountable.picture
    userAccountable.date = new Date().toString()

    // add final account balance data in user model
    if (user) {
      user.accountable = {
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

    userAccountable.add_money_history = userAddMoneyHistory
    return await userAccountable.save()
  }
}

export const AddMoneyServices = {
  createAddMoney,
}
