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

  const newWithdrawRecord = new WithdrawMoneyModel({
    ...withdrawData,
  })

  return await newWithdrawRecord.save()
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

  withdrawRecord.withdraw_status = 'approved'
  await withdrawRecord.save()

  return withdrawRecord
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
