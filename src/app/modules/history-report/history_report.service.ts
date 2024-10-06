import {
  AddMoneyHistoryModel,
  ReferralBonusHistoryModel,
} from './history_report.model'
import { PurchaseMoneyModel } from '../purchase/purchase.model'

const getPurchaseHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const userPurchaseHistory = await PurchaseMoneyModel.find({ userId })
    .skip(skip)
    .limit(limit)

  const total = await PurchaseMoneyModel.countDocuments({ userId })
  return { userPurchaseHistory, total, page, limit }
}

const getAddMoneyHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const addMoneyHistories = await AddMoneyHistoryModel.find({ userId })
    .skip(skip)
    .limit(limit)

  const total = await AddMoneyHistoryModel.countDocuments({ userId })
  return { addMoneyHistories, total, page, limit }
}

const getReferralBonusHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const referralBonusHistories = await ReferralBonusHistoryModel.find({
    userId,
  })
    .skip(skip)
    .limit(limit)

  const total = await ReferralBonusHistoryModel.countDocuments({ userId })
  return { referralBonusHistories, total, page, limit }
}

export const AddMoneyHistoryServices = {
  getPurchaseHistoryFromDB,
  getAddMoneyHistoryFromDB,
  getReferralBonusHistoryFromDB,
}
