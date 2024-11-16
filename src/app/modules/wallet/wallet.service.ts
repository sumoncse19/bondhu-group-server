import {
  DirectorshipPaymentModel,
  ShareHolderPaymentModel,
} from './wallet.model'
import {
  IDirectorshipPayment,
  IShareHolderPayment,
  IShareHolderProfit,
} from './wallet.interface'
import httpStatus from 'http-status'
import AppError from '../shared/errors/AppError'
import { UserModel } from '../user/user.model'
import { clearUserCache } from '../shared/utils'

const createShareHolderPayment = async (data: IShareHolderPayment) => {
  const result = await ShareHolderPaymentModel.create(data)
  return result
}

const createDirectorshipPayment = async (data: IDirectorshipPayment) => {
  const result = await DirectorshipPaymentModel.create(data)
  return result
}

const getShareHolderPaymentQuery = async (
  date: string,
  is_paid: string,
  userId: string,
) => {
  const searchableDate = new Date(date)

  const query: {
    payment_date?: string
    is_paid?: boolean
    userId?: string
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId) query.userId = userId

  const allShareHolderPaymentByDate = await ShareHolderPaymentModel.find(
    query,
  ).sort({ _id: -1 })

  const total = await ShareHolderPaymentModel.countDocuments(query)

  return { allShareHolderPaymentByDate, total }
}

const getDirectorshipPaymentQuery = async (
  date: string,
  is_paid: string,
  userId: string,
) => {
  const searchableDate = new Date(date)

  const query: {
    payment_date?: string
    is_paid?: boolean
    userId?: string
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId) query.userId = userId

  const allDirectorshipPaymentByDate = await DirectorshipPaymentModel.find(
    query,
  ).sort({ _id: -1 })

  const total = await DirectorshipPaymentModel.countDocuments(query)

  return { allDirectorshipPaymentByDate, total }
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
  shareHolderPayment.payment_date = shareHolderProfitData.profit_date
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

const sendDirectorshipProfit = async (
  directorshipProfitData: IShareHolderProfit,
) => {
  const directorshipPayment = await DirectorshipPaymentModel.findById(
    directorshipProfitData.share_holder_payment_id,
  )

  if (!directorshipPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Directorship payment not found')
  }

  if (directorshipPayment.is_paid)
    throw new AppError(httpStatus.CONFLICT, 'This payment is already paid.')

  const directorshipUser = await UserModel.findById(directorshipPayment.userId)

  if (!directorshipUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Directorship user not found')
  }

  directorshipUser.wallet = {
    ...directorshipUser.wallet,
    directorship_wallet:
      (directorshipUser.wallet.directorship_wallet || 0) +
      directorshipProfitData.profit_amount,
  }

  await directorshipUser.save()
  await clearUserCache(directorshipUser._id.toString())

  directorshipPayment.is_paid = true
  await directorshipPayment.save()

  // Add one month to the date
  const paymentDate = new Date(directorshipPayment.payment_date)
  paymentDate.setMonth(paymentDate.getMonth() + 1)

  return await createDirectorshipPayment({
    userId: directorshipPayment.userId,
    add_money_history_id: directorshipPayment.add_money_history_id,
    payment_method: directorshipPayment.payment_method,
    money_receipt_number: directorshipPayment.money_receipt_number,
    directorship_amount: directorshipPayment.directorship_amount,
    payment_date: paymentDate.toISOString(),
    is_paid: false,
  })
}

export const WalletService = {
  createShareHolderPayment,
  createDirectorshipPayment,
  getShareHolderPaymentQuery,
  getDirectorshipPaymentQuery,
  sendShareHolderProfit,
  sendDirectorshipProfit,
}
