import httpStatus from 'http-status'
import AppError from '../shared/errors/AppError'
import { UserModel } from '../user/user.model'
import { IPurchaseMoney } from './purchase.interface'
import { PurchaseMoneyModel } from './purchase.model'
// import { clearUserCache } from '../shared/utils'

const createPurchaseIntoDB = async (purchaseData: IPurchaseMoney) => {
  const user = await UserModel.findOne({
    _id: purchaseData.userId,
  })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const userPurchaseHistory = await PurchaseMoneyModel.findOne({
    userId: purchaseData.userId,
  })

  const purchaseFromUser = await UserModel.findOne({
    _id: purchaseData.purchase_from,
  })
  if (!purchaseFromUser)
    throw new AppError(httpStatus.NOT_FOUND, 'Purchase from user not found')

  if (purchaseFromUser) {
    if (
      purchaseFromUser.wallet.purchase_wallet > purchaseData.purchase_amount
    ) {
      const currentPurchase = {
        purchase_from: purchaseData.purchase_from,
        purchase_amount: purchaseData.purchase_amount,
        date: purchaseData.date ? purchaseData.date : new Date().toString(),
      }

      purchaseFromUser.wallet = {
        ...purchaseFromUser.wallet,
        purchase_wallet:
          purchaseFromUser.wallet.purchase_wallet -
          purchaseData.purchase_amount,
      }
      await purchaseFromUser.save()

      if (!userPurchaseHistory) {
        const newPurchaseRecord = new PurchaseMoneyModel({
          userId: purchaseData.userId,
          purchase_amount: purchaseData.purchase_amount,
          purchase_amount_history: [currentPurchase],
        })
        if (user) {
          user.wallet = {
            ...user.wallet,
            purchase_wallet: purchaseData.purchase_amount,
          }
          await user.save()
          // await clearUserCache(user._id.toString())
        }
        return await newPurchaseRecord.save()
      } else {
        userPurchaseHistory.purchase_amount += purchaseData.purchase_amount
        userPurchaseHistory.purchase_amount_history.push(currentPurchase)
        if (user) {
          user.wallet = {
            ...user.wallet,
            purchase_wallet: userPurchaseHistory.purchase_amount,
          }
          await user.save()
          // await clearUserCache(user._id.toString())
        }
        return await userPurchaseHistory.save()
      }
    }
  } else {
    throw new AppError(
      httpStatus.CONFLICT,
      `You don't have enough balance to send purchase money`,
    )
  }
}

const getAllPurchaseHistoryFromDB = async (page: number, limit: number) => {
  const skip = (page - 1) * limit

  const userPurchaseHistory = await PurchaseMoneyModel.find({})
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  if (userPurchaseHistory.length > 0) {
    const purchaseHistory: unknown[] = []

    await Promise.all(
      userPurchaseHistory.map(async (singleUserPurchase) => {
        const user = await UserModel.findOne({
          _id: singleUserPurchase.userId,
        }).select('_id name user_name')

        singleUserPurchase.purchase_amount_history.forEach(
          async (singlePurchase) => {
            const purchaseFromUser = await UserModel.findOne({
              _id: singlePurchase.purchase_from,
            }).select('_id name user_name')

            const currentPurchase = {
              _id: singleUserPurchase._id,
              purchase_from: purchaseFromUser,
              purchase_to: user,
              purchase_amount: singlePurchase.purchase_amount,
              purchase_date: singlePurchase.date,
            }

            purchaseHistory.push(currentPurchase)
          },
        )
      }),
    )

    const total = await PurchaseMoneyModel.countDocuments({})
    return { purchaseHistory, total, page, limit }
  } else {
    throw new AppError(httpStatus.NOT_FOUND, 'No purchase history found')
  }
}

export const PurchaseServices = {
  createPurchaseIntoDB,
  getAllPurchaseHistoryFromDB,
}
