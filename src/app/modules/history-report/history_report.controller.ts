/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { IAddMoneyHistory } from './history_report.interface'
import { AddMoneyHistoryServices } from './history_report.service'

const createAddMoneyHistory = catchAsync(
  async (req: Request, res: Response) => {
    const addMoneyHistoryData: IAddMoneyHistory = req.body
    const newAddMoney =
      await AddMoneyHistoryServices.createAddMoneyHistory(addMoneyHistoryData)
    return SUCCESS(
      res,
      httpStatus.CREATED,
      'Add Money data created successfully',
      newAddMoney,
    )
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to create Add Money data',
)

const getPurchaseHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const users = await AddMoneyHistoryServices.getPurchaseHistoryFromDB(userId)

  return SUCCESS(res, httpStatus.OK, 'Get purchase history successfully', users)
})

const getAddMoneyHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const addMoneyHistory =
    await AddMoneyHistoryServices.getAddMoneyHistoryFromDB(userId)

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
    const addMoneyHistory =
      await AddMoneyHistoryServices.getReferralBonusHistoryFromDB(userId)

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get users referral bonus history successfully',
      addMoneyHistory,
    )
  },
)

export const HistoryControllers = {
  createAddMoneyHistory,
  getPurchaseHistory,
  getAddMoneyHistory,
  getReferralBonusHistory,
}
