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

export const PurchaseMoneyControllers = {
  purchaseMoney,
}
