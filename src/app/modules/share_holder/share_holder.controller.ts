import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { ShareHolderService } from './share_holder.service'
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'

const getShareHolderPaymentQuery = catchAsync(
  async (req: Request, res: Response) => {
    const { date, is_paid, userId } = req.query

    const allShareHolderPaymentByDate =
      await ShareHolderService.getShareHolderPaymentQuery(
        date as string,
        is_paid as string,
        userId as string,
      )

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get all share holder payment by date successfully',
      allShareHolderPaymentByDate,
    )
  },
)

const sendShareHolderProfit = catchAsync(
  async (req: Request, res: Response) => {
    await ShareHolderService.sendShareHolderProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send share holder profit successfully')
  },
)

export const ShareHolderController = {
  getShareHolderPaymentQuery,
  sendShareHolderProfit,
}
