/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { AddMoneyHistoryServices } from './history_report.service'

const getPurchaseHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { page = '1', limit = '10' } = req.query

  const pageNum = parseInt(page as string, 10)
  const limitNum = parseInt(limit as string, 10)

  const users = await AddMoneyHistoryServices.getPurchaseHistoryFromDB(
    userId,
    pageNum,
    limitNum,
  )

  return SUCCESS(res, httpStatus.OK, 'Get purchase history successfully', users)
})

const getAddMoneyHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { page = '1', limit = '10' } = req.query

  const pageNum = parseInt(page as string, 10)
  const limitNum = parseInt(limit as string, 10)

  const addMoneyHistory =
    await AddMoneyHistoryServices.getAddMoneyHistoryFromDB(
      userId,
      pageNum,
      limitNum,
    )

  return SUCCESS(
    res,
    httpStatus.OK,
    'Get users add money history successfully',
    addMoneyHistory,
  )
})

const getReferralBonusHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params
    const { page = '1', limit = '10' } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const addMoneyHistory =
      await AddMoneyHistoryServices.getReferralBonusHistoryFromDB(
        userId,
        pageNum,
        limitNum,
      )

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get users referral bonus history successfully',
      addMoneyHistory,
    )
  },
)

export const HistoryControllers = {
  getPurchaseHistory,
  getAddMoneyHistory,
  getReferralBonusHistory,
}
