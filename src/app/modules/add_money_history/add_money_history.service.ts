import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoneyHistory } from './add_money_history.interface'
import { AddMoneyHistoryModel } from './add_money_history.model'

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

const getAddMoneyHistory = async (userId: string) => {
  const addMoneyHistories = await AddMoneyHistoryModel.find({
    userId: userId,
  })

  return addMoneyHistories
}

export const AddMoneyHistoryServices = {
  createAddMoneyHistory,
  getAddMoneyHistory,
}
