import {
  DirectorshipPaymentModel,
  FixedDepositPaymentModel,
  ProjectSharePaymentModel,
  ShareHolderPaymentModel,
} from './wallet.model'
import {
  IDirectorshipPayment,
  IShareHolderPayment,
  IShareHolderProfit,
  IProjectSharePayment,
  IFixedDepositPayment,
} from './wallet.interface'
import httpStatus from 'http-status'
import AppError from '../shared/errors/AppError'
import { UserModel } from '../user/user.model'
import mongoose from 'mongoose'

const createProjectSharePayment = async (data: IProjectSharePayment) => {
  const result = await ProjectSharePaymentModel.create(data)
  return result
}

const getProjectSharePaymentQuery = async (
  date: string,
  is_paid: string,
  userId: string,
) => {
  const searchableDate = new Date(date)
  const query: {
    payment_date?: string
    is_paid?: boolean
    userId?: mongoose.Types.ObjectId
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId && userId !== 'undefined' && userId !== 'null') {
    query.userId = new mongoose.Types.ObjectId(userId)
  }

  const allProjectSharePaymentByDate = await ProjectSharePaymentModel.find(
    query,
  ).sort({ _id: -1 })

  const total = await ProjectSharePaymentModel.countDocuments(query)

  return { allProjectSharePaymentByDate, total }
}

const sendSingleProjectShareProfit = async (
  project_share_payment_id: string,
) => {
  const projectSharePayment = await ProjectSharePaymentModel.findById(
    project_share_payment_id,
  )

  if (!projectSharePayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project share payment not found')
  }

  if (projectSharePayment.is_paid)
    throw new AppError(httpStatus.CONFLICT, 'This payment is already paid.')

  const projectShareUser = await UserModel.findById(projectSharePayment.userId)

  if (!projectShareUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project share user not found')
  }

  if (projectSharePayment.payment_count === 25) {
    projectShareUser.accountable = {
      ...projectShareUser.accountable,
      project_share:
        projectShareUser.accountable.project_share -
        projectSharePayment.project_share_amount,
    }
  }

  projectShareUser.wallet = {
    ...projectShareUser.wallet,
    project_share_wallet:
      (projectShareUser.wallet.project_share_wallet || 0) +
      projectSharePayment.project_share_amount * 0.08,
  }

  await projectShareUser.save()
  // await clearUserCache(projectShareUser._id.toString())

  projectSharePayment.is_paid = true
  projectSharePayment.payment_send_date = new Date().toISOString()
  projectSharePayment.profit_amount =
    projectSharePayment.project_share_amount * 0.08

  await projectSharePayment.save()

  if (projectSharePayment.payment_count < 25) {
    // Add one month to the date
    const paymentDate = new Date(projectSharePayment.payment_date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    return await createProjectSharePayment({
      userId: projectSharePayment.userId,
      name: projectSharePayment.name,
      user_name: projectSharePayment.user_name,
      add_money_history_id: projectSharePayment.add_money_history_id,
      payment_method: projectSharePayment.payment_method,
      money_receipt_number: projectSharePayment.money_receipt_number,
      project_share_amount: projectSharePayment.project_share_amount,
      profit_amount: 0,
      payment_count: projectSharePayment.payment_count + 1,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  } else {
    return projectSharePayment
  }
}

const sendSelectedProjectShareProfit = async (
  projectShareProfitData: string[],
) => {
  const result = await Promise.all(
    projectShareProfitData.map(async (data) => {
      return await sendSingleProjectShareProfit(data.toString())
    }),
  )
  return result
}

const createFixedDepositPayment = async (data: IFixedDepositPayment) => {
  const result = await FixedDepositPaymentModel.create(data)
  return result
}

const getFixedDepositPaymentQuery = async (
  date: string,
  is_paid: string,
  userId: string,
) => {
  const searchableDate = new Date(date)
  const query: {
    payment_date?: string
    is_paid?: boolean
    userId?: mongoose.Types.ObjectId
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId && userId !== 'undefined' && userId !== 'null') {
    query.userId = new mongoose.Types.ObjectId(userId)
  }

  const allFixedDepositPaymentByDate = await FixedDepositPaymentModel.find(
    query,
  ).sort({ _id: -1 })

  const total = await FixedDepositPaymentModel.countDocuments(query)

  return { allFixedDepositPaymentByDate, total }
}

const sendSingleFixedDepositProfit = async (
  fixed_deposit_payment_id: string,
) => {
  const fixedDepositPayment = await FixedDepositPaymentModel.findById(
    fixed_deposit_payment_id,
  )

  if (!fixedDepositPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fixed deposit payment not found')
  }

  if (fixedDepositPayment.is_paid)
    throw new AppError(httpStatus.CONFLICT, 'This payment is already paid.')

  const fixedDepositUser = await UserModel.findById(fixedDepositPayment.userId)

  if (!fixedDepositUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fixed deposit user not found')
  }

  if (fixedDepositPayment.payment_count === 25) {
    fixedDepositUser.accountable = {
      ...fixedDepositUser.accountable,
      fixed_deposit:
        fixedDepositUser.accountable.fixed_deposit -
        fixedDepositPayment.fixed_deposit_amount,
    }
  }

  fixedDepositUser.wallet = {
    ...fixedDepositUser.wallet,
    fixed_deposit_wallet:
      (fixedDepositUser.wallet.fixed_deposit_wallet || 0) +
      fixedDepositPayment.fixed_deposit_amount * 0.05,
  }

  await fixedDepositUser.save()
  // await clearUserCache(fixedDepositUser._id.toString())

  fixedDepositPayment.is_paid = true
  fixedDepositPayment.payment_send_date = new Date().toISOString()
  fixedDepositPayment.profit_amount =
    fixedDepositPayment.fixed_deposit_amount * 0.05

  await fixedDepositPayment.save()

  if (fixedDepositPayment.payment_count < 25) {
    // Add one month to the date
    const paymentDate = new Date(fixedDepositPayment.payment_date)
    paymentDate.setMonth(paymentDate.getMonth() + 1)

    return await createFixedDepositPayment({
      userId: fixedDepositPayment.userId,
      name: fixedDepositPayment.name,
      user_name: fixedDepositPayment.user_name,
      add_money_history_id: fixedDepositPayment.add_money_history_id,
      payment_method: fixedDepositPayment.payment_method,
      money_receipt_number: fixedDepositPayment.money_receipt_number,
      fixed_deposit_amount: fixedDepositPayment.fixed_deposit_amount,
      profit_amount: 0,
      payment_count: fixedDepositPayment.payment_count + 1,
      payment_date: paymentDate.toISOString(),
      is_paid: false,
    })
  } else {
    return fixedDepositPayment
  }
}

const sendSelectedFixedDepositProfit = async (
  fixedDepositProfitData: string[],
) => {
  const result = await Promise.all(
    fixedDepositProfitData.map(async (data) => {
      return await sendSingleFixedDepositProfit(data.toString())
    }),
  )
  return result
}

const createShareHolderPayment = async (data: IShareHolderPayment) => {
  const result = await ShareHolderPaymentModel.create(data)
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
    userId?: mongoose.Types.ObjectId
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId && userId !== 'undefined' && userId !== 'null') {
    query.userId = new mongoose.Types.ObjectId(userId)
  }

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
  // await clearUserCache(shareHolderUser._id.toString())

  shareHolderPayment.is_paid = true
  shareHolderPayment.payment_send_date = shareHolderProfitData.profit_date
  shareHolderPayment.profit_amount = shareHolderProfitData.profit_amount
  await shareHolderPayment.save()

  // Add one month to the date
  const paymentDate = new Date(shareHolderPayment.payment_date)
  paymentDate.setMonth(paymentDate.getMonth() + 1)

  return await createShareHolderPayment({
    userId: shareHolderPayment.userId,
    name: shareHolderPayment.name,
    user_name: shareHolderPayment.user_name,
    add_money_history_id: shareHolderPayment.add_money_history_id,
    payment_method: shareHolderPayment.payment_method,
    money_receipt_number: shareHolderPayment.money_receipt_number,
    share_holder_amount: shareHolderPayment.share_holder_amount,
    profit_amount: 0,
    payment_date: paymentDate.toISOString(),
    is_paid: false,
  })
}

const createDirectorshipPayment = async (data: IDirectorshipPayment) => {
  const result = await DirectorshipPaymentModel.create(data)
  return result
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
    userId?: mongoose.Types.ObjectId
  } = {}

  if (date) query.payment_date = searchableDate.toISOString()

  if (is_paid) query.is_paid = is_paid === 'true' ? true : false

  if (userId && userId !== 'undefined' && userId !== 'null') {
    query.userId = new mongoose.Types.ObjectId(userId)
  }

  const allDirectorshipPaymentByDate = await DirectorshipPaymentModel.find(
    query,
  ).sort({ _id: -1 })

  const total = await DirectorshipPaymentModel.countDocuments(query)

  return { allDirectorshipPaymentByDate, total }
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
  // await clearUserCache(directorshipUser._id.toString())

  directorshipPayment.is_paid = true
  directorshipPayment.payment_send_date = directorshipProfitData.profit_date
  directorshipPayment.profit_amount = directorshipProfitData.profit_amount
  await directorshipPayment.save()

  // Add one month to the date
  const paymentDate = new Date(directorshipPayment.payment_date)
  paymentDate.setMonth(paymentDate.getMonth() + 1)

  return await createDirectorshipPayment({
    userId: directorshipPayment.userId,
    name: directorshipPayment.name,
    user_name: directorshipPayment.user_name,
    add_money_history_id: directorshipPayment.add_money_history_id,
    payment_method: directorshipPayment.payment_method,
    money_receipt_number: directorshipPayment.money_receipt_number,
    directorship_amount: directorshipPayment.directorship_amount,
    profit_amount: directorshipPayment.profit_amount,
    payment_date: paymentDate.toISOString(),
    is_paid: false,
  })
}

export const WalletService = {
  createProjectSharePayment,
  getProjectSharePaymentQuery,
  sendSingleProjectShareProfit,
  sendSelectedProjectShareProfit,

  createFixedDepositPayment,
  getFixedDepositPaymentQuery,
  sendSingleFixedDepositProfit,
  sendSelectedFixedDepositProfit,

  createShareHolderPayment,
  getShareHolderPaymentQuery,
  sendShareHolderProfit,

  createDirectorshipPayment,
  getDirectorshipPaymentQuery,
  sendDirectorshipProfit,
}
