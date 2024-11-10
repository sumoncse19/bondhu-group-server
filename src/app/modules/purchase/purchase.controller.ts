import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import httpStatus from 'http-status'
import { PurchaseServices } from './purchase.service'
import { SUCCESS } from '../shared/api.response.types'

const purchaseMoney = catchAsync(
  async (req: Request, res: Response) => {
    const purchaseData = req.body
    const purchaseResult =
      await PurchaseServices.createPurchaseIntoDB(purchaseData)
    return SUCCESS(
      res,
      httpStatus.CREATED,
      'Purchased Money created successfully',
      purchaseResult,
    )
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to Purchase Money',
)

const getAllPurchaseHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { page = '1', limit = '10' } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const users = await PurchaseServices.getAllPurchaseHistoryFromDB(
      pageNum,
      limitNum,
    )

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get all purchase history successfully',
      users,
    )
  },
)

export const PurchaseMoneyControllers = {
  purchaseMoney,
  getAllPurchaseHistory,
}
