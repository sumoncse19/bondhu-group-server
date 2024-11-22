import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { WalletService } from './wallet.service'
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'

const getProjectSharePaymentQuery = catchAsync(
  async (req: Request, res: Response) => {
    const { date, is_paid, userId } = req.query

    const allProjectSharePaymentByDate =
      await WalletService.getProjectSharePaymentQuery(
        date as string,
        is_paid as string,
        userId as string,
      )

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get all project share payment by date successfully',
      allProjectSharePaymentByDate,
    )
  },
)

const sendSingleProjectShareProfit = catchAsync(
  async (req: Request, res: Response) => {
    const { project_share_payment_id } = req.params
    await WalletService.sendSingleProjectShareProfit(project_share_payment_id)

    return SUCCESS(res, httpStatus.OK, 'Send project share profit successfully')
  },
)

const sendSelectedProjectShareProfit = catchAsync(
  async (req: Request, res: Response) => {
    await WalletService.sendProjectShareProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send project share profit successfully')
  },
)

const sendAllProjectShareByDate = catchAsync(
  async (req: Request, res: Response) => {
    await WalletService.sendProjectShareProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send project share profit successfully')
  },
)

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

const sendShareHolderProfit = catchAsync(
  async (req: Request, res: Response) => {
    await WalletService.sendShareHolderProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send share holder profit successfully')
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

const sendDirectorshipProfit = catchAsync(
  async (req: Request, res: Response) => {
    await WalletService.sendDirectorshipProfit(req.body)

    return SUCCESS(res, httpStatus.OK, 'Send directorship profit successfully')
  },
)

export const WalletController = {
  getProjectSharePaymentQuery,
  sendSingleProjectShareProfit,
  sendSelectedProjectShareProfit,
  sendAllProjectShareByDate,
  getShareHolderPaymentQuery,
  sendShareHolderProfit,

  getDirectorshipPaymentQuery,
  sendDirectorshipProfit,
}
