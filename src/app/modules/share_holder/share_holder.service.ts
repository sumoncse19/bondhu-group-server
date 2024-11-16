import { ShareHolderPaymentModel } from './share_holder.model'
import {
  IShareHolderPayment,
  IShareHolderProfit,
} from './share_holder.interface'
import httpStatus from 'http-status'
import AppError from '../shared/errors/AppError'
import { UserModel } from '../user/user.model'
import { clearUserCache } from '../shared/utils'

const createShareHolderPayment = async (data: IShareHolderPayment) => {
  const result = await ShareHolderPaymentModel.create(data)
  return result
}

const getShareHolderPaymentQuery = async (
  date: string,
  is_paid: string,
  userId: string,
) => {
  // Parse the input date
  const searchableDate = new Date(date)

  const query: {
    payment_date?: string
    is_paid?: boolean
    userId?: string
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId) query.userId = userId

  // Query the database for the range
  const allShareHolderPaymentByDate = await ShareHolderPaymentModel.find(
    query,
  ).sort({ _id: -1 })

  const total = await ShareHolderPaymentModel.countDocuments(query)

  return { allShareHolderPaymentByDate, total }
}

const sendShareHolderProfit = async (
  shareHolderProfitData: IShareHolderProfit,
) => {
  const shareHolderPayment = await ShareHolderPaymentModel.findById(
    shareHolderProfitData.share_holder_payment_id,
  )

  if (!shareHolderPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Share holder payment not found')
  }

  if (shareHolderPayment.is_paid)
    throw new AppError(httpStatus.CONFLICT, 'This payment is already paid.')

  const shareHolderUser = await UserModel.findById(shareHolderPayment.userId)

  if (!shareHolderUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Share holder user not found')
  }

  shareHolderUser.wallet = {
    ...shareHolderUser.wallet,
    share_holder_wallet:
      (shareHolderUser.wallet.share_holder_wallet || 0) +
      shareHolderProfitData.profit_amount,
  }

  await shareHolderUser.save()
  await clearUserCache(shareHolderUser._id.toString())

  shareHolderPayment.is_paid = true
  await shareHolderPayment.save()

  // Add one month to the date
  const paymentDate = new Date(shareHolderPayment.payment_date)
  paymentDate.setMonth(paymentDate.getMonth() + 1)

  return await createShareHolderPayment({
    userId: shareHolderPayment.userId,
    add_money_history_id: shareHolderPayment.add_money_history_id,
    payment_method: shareHolderPayment.payment_method,
    money_receipt_number: shareHolderPayment.money_receipt_number,
    share_holder_amount: shareHolderPayment.share_holder_amount,
    payment_date: paymentDate.toISOString(),
    is_paid: false,
  })
}

export const ShareHolderService = {
  createShareHolderPayment,
  getShareHolderPaymentQuery,
  sendShareHolderProfit,
}
