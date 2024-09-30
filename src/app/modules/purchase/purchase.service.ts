import httpStatus from 'http-status'
import AppError from '../shared/errors/AppError'
import { UserModel } from '../user/user.model'
import { IPurchaseMoney } from './purchase.interface'
import { PurchaseMoneyModel } from './purchase.model'

const createPurchase = async (purchaseData: IPurchaseMoney) => {
  const user = await UserModel.findOne({
    _id: purchaseData.userId,
  })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const userPurchaseHistory = await PurchaseMoneyModel.findOne({
    userId: purchaseData.userId,
  })

  const currentPurchase = {
    purchase_from: purchaseData.purchase_from,
    purchase_amount: purchaseData.purchase_amount,
    date: purchaseData.date ? purchaseData.date : new Date().toString(),
  }

  if (!userPurchaseHistory) {
    const newPurchaseRecord = new PurchaseMoneyModel({
      userId: purchaseData.userId,
      purchase_amount: purchaseData.purchase_amount,
      purchase_amount_history: [currentPurchase],
    })
    if (user) {
      user.wallet = {
        purchase_wallet: purchaseData.purchase_amount,
      }
      await user.save()
    }
    return await newPurchaseRecord.save()
  } else {
    userPurchaseHistory.purchase_amount += purchaseData.purchase_amount
    userPurchaseHistory.purchase_amount_history.push(currentPurchase)
    if (user) {
      user.wallet = {
        purchase_wallet: userPurchaseHistory.purchase_amount,
      }
      await user.save()
    }
    return await userPurchaseHistory.save()
  }
}

export const PurchaseServices = {
  createPurchase,
}
