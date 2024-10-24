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

// Example usage inside approveAddMoney:
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
    $or: [{ withdraw_status: 'pending' }, { is_withdrawn: false }],
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await WithdrawMoneyModel.countDocuments({
    $or: [{ withdraw_status: 'pending' }, { is_withdrawn: false }],
  })

  return { allRequestedWithdraw, total, page, limit }
}

export const WithdrawServices = {
  requestForWithdraw,
  approveWithdrawMoneyRequest,
  getAllRequestedWithdrawFromDB,
}
