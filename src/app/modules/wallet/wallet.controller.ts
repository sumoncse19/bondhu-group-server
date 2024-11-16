import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { WalletService } from './wallet.service'
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'

const getShareHolderPaymentQuery = catchAsync(
  async (req: Request, res: Response) => {
    const { date, is_paid, userId } = req.query

    const allShareHolderPaymentByDate =
      await WalletService.getShareHolderPaymentQuery(
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

const getDirectorshipPaymentQuery = catchAsync(
  async (req: Request, res: Response) => {
    const { date, is_paid, userId } = req.query

    const allDirectorshipPaymentByDate =
      await WalletService.getDirectorshipPaymentQuery(
        date as string,
        is_paid as string,
        userId as string,
      )

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get all directorship payment by date successfully',
      allDirectorshipPaymentByDate,
    )
  },
)

const sendShareHolderProfit = catchAsync(
  async (req: Request, res: Response) => {
    await WalletService.sendShareHolderProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send share holder profit successfully')
  },
)

const sendDirectorshipProfit = catchAsync(
  async (req: Request, res: Response) => {
    await WalletService.sendDirectorshipProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send directorship profit successfully')
  },
)

export const WalletController = {
  getShareHolderPaymentQuery,
  getDirectorshipPaymentQuery,
  sendShareHolderProfit,
  sendDirectorshipProfit,
}
