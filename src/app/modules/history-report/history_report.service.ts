import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoneyHistory } from './history_report.interface'
import {
  AddMoneyHistoryModel,
  ReferralBonusHistoryModel,
} from './history_report.model'
import { PurchaseMoneyModel } from '../purchase/purchase.model'

const createAddMoneyHistory = async (addMoneyHistoryData: IAddMoneyHistory) => {
  const existingTransactionNumber = await AddMoneyHistoryModel.findOne({
    user_name: addMoneyHistoryData.transaction_id,
  })
  const existingMoneyReceiptNumber = await AddMoneyHistoryModel.findOne({
    user_name: addMoneyHistoryData.money_receipt_number,
  })
  if (existingTransactionNumber) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This transaction number is already in use.',
    )
  }
  if (existingMoneyReceiptNumber) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This transaction number is already in use.',
    )
  }

  const addMoneyHistory = new AddMoneyHistoryModel(addMoneyHistoryData)

  const createdAddMoneyHistory = await addMoneyHistory.save()
  return createdAddMoneyHistory
}

const getPurchaseHistoryFromDB = async (userId: string) => {
  const userPurchaseHistory = await PurchaseMoneyModel.findOne({
    userId: userId,
  })

  return userPurchaseHistory
}

const getAddMoneyHistoryFromDB = async (userId: string) => {
  const addMoneyHistories = await AddMoneyHistoryModel.find({
    userId: userId,
  })

  return addMoneyHistories
}

const getReferralBonusHistoryFromDB = async (userId: string) => {
  const referralBonusHistories = await ReferralBonusHistoryModel.find({
    userId: userId,
  })

  return referralBonusHistories
}

export const AddMoneyHistoryServices = {
  createAddMoneyHistory,
  getPurchaseHistoryFromDB,
  getAddMoneyHistoryFromDB,
  getReferralBonusHistoryFromDB,
}
