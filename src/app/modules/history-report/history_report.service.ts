import {
  AddMoneyHistoryModel,
  MatchingBonusHistoryModel,
  ReferralBonusHistoryModel,
} from './history_report.model'
import { PurchaseMoneyModel } from '../purchase/purchase.model'
import { RequestAddMoneyModel } from '../add_money/add_money.model'

const getPurchaseHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const userPurchaseHistory = await PurchaseMoneyModel.findOne({ userId })
    .select('purchase_amount_history')
    .lean()

  if (!userPurchaseHistory || !userPurchaseHistory.purchase_amount_history) {
    return {
      purchaseAmountHistory: [],
      total: 0,
      page,
      limit,
    }
  }

  // Sort purchase_amount_history by date in descending order
  const sortedHistory = userPurchaseHistory.purchase_amount_history.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Apply pagination to the sorted history array
  const paginatedHistory = sortedHistory.slice(skip, skip + limit)

  return {
    purchaseAmountHistory: paginatedHistory,
    total: userPurchaseHistory.purchase_amount_history.length,
    page,
    limit,
  }
}

const getJoiningCostHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const userPurchaseHistory = await PurchaseMoneyModel.findOne({ userId })
    .select('joining_cost_history')
    .lean()

  if (!userPurchaseHistory || !userPurchaseHistory.joining_cost_history) {
    return {
      joiningCostHistory: [],
      total: 0,
      page,
      limit,
    }
  }

  // Sort joining_cost_history by date in descending order
  const sortedHistory = userPurchaseHistory.joining_cost_history.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Apply pagination to the sorted history array
  const paginatedHistory = sortedHistory.slice(skip, skip + limit)

  return {
    joiningCostHistory: paginatedHistory,
    total: userPurchaseHistory.joining_cost_history.length,
    page,
    limit,
  }
}

const getAllAddMoneyHistoryFromDB = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const addMoneyHistories = await AddMoneyHistoryModel.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await AddMoneyHistoryModel.countDocuments({})
  return { addMoneyHistories, total, page, limit }
}

const getAddMoneyHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const addMoneyHistories = await RequestAddMoneyModel.find({ userId })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await RequestAddMoneyModel.countDocuments({ userId })
  return { addMoneyHistories, total, page, limit }
}

const getMatchingBonusHistoryFromDB = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit

  const matchingBonusHistories = await MatchingBonusHistoryModel.find({
    userId,
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await MatchingBonusHistoryModel.countDocuments({ userId })
  return { matchingBonusHistories, total, page, limit }
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
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const total = await ReferralBonusHistoryModel.countDocuments({ userId })
  return { referralBonusHistories, total, page, limit }
}

export const AddMoneyHistoryServices = {
  getPurchaseHistoryFromDB,
  getJoiningCostHistoryFromDB,
  getAllAddMoneyHistoryFromDB,
  getAddMoneyHistoryFromDB,
  getMatchingBonusHistoryFromDB,
  getReferralBonusHistoryFromDB,
}
