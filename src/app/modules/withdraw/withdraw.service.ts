import httpStatus from 'http-status'
import AppError from '../shared/errors/AppError'
import { UserModel } from '../user/user.model'
import { IWithdrawMoney } from './withdraw.interface'
import { WithdrawMoneyModel } from './withdraw.model'

const requestForWithdraw = async (withdrawData: IWithdrawMoney) => {
  const user = await UserModel.findOne({
    _id: withdrawData.userId,
  })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  if (user.security_code !== withdrawData.security_code) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Security code is incorrect')
  }

  if (user.accountable.total_amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Your total account balance is 0, we can't process your withdraw request.`,
    )
  }

  if (
    user.wallet[withdrawData.withdraw_wallet] > withdrawData.withdraw_amount
  ) {
    const newWithdrawRecord = new WithdrawMoneyModel({
      ...withdrawData,
    })

    return await newWithdrawRecord.save()
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Your ${withdrawData.withdraw_wallet} balance is 0 or less than your withdraw amount, we can't process your withdraw request.`,
    )
  }
}

const getWithdrawHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const addMoneyHistories = await WithdrawMoneyModel.find({ userId })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await WithdrawMoneyModel.countDocuments({ userId })
  return { addMoneyHistories, total, page, limit }
}

const approveWithdrawMoneyRequest = async (withdrawId: string) => {
  const withdrawRecord = await WithdrawMoneyModel.findById(withdrawId)
  if (!withdrawRecord)
    throw new AppError(httpStatus.NOT_FOUND, 'Withdraw request not found')

  const user = await UserModel.findOne({
    _id: withdrawRecord.userId,
  })

  if (
    user &&
    user.wallet[withdrawRecord.withdraw_wallet] >
      withdrawRecord.withdraw_amount &&
    withdrawRecord.withdraw_status === 'pending'
  ) {
    user.wallet = {
      ...user.wallet,
      [withdrawRecord.withdraw_wallet]:
        user.wallet[withdrawRecord.withdraw_wallet] -
        withdrawRecord.withdraw_amount,
    }
    await user.save()

    withdrawRecord.withdraw_status = 'approved'
    await withdrawRecord.save()
    return withdrawRecord
  } else if (withdrawRecord.withdraw_status === 'approved') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This request is already approved',
    )
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User don't have enough balance to approve this request",
    )
  }
}

const getAllRequestedWithdrawFromDB = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const allRequestedWithdraw = await WithdrawMoneyModel.find({
    $or: [{ withdraw_status: 'pending' }],
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await WithdrawMoneyModel.countDocuments({
    $or: [{ withdraw_status: 'pending' }],
  })

  return { allRequestedWithdraw, total, page, limit }
}

const getAllWithdrawHistoryFromDB = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const allRequestedWithdraw = await WithdrawMoneyModel.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await WithdrawMoneyModel.countDocuments({})

  return { allRequestedWithdraw, total, page, limit }
}

export const WithdrawServices = {
  requestForWithdraw,
  getWithdrawHistoryFromDB,
  approveWithdrawMoneyRequest,
  getAllRequestedWithdrawFromDB,
  getAllWithdrawHistoryFromDB,
}
