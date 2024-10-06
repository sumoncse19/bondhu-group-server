/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { IAddMoneyHistory } from './add_money_history.interface'
import { AddMoneyHistoryServices } from './add_money_history.service'

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

const getAddMoneyHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params
  const addMoneyHistory =
    await AddMoneyHistoryServices.getAddMoneyHistory(userId)

  return SUCCESS(
    res,
    httpStatus.OK,
    'Get users add money history successfully',
    addMoneyHistory,
  )
})

export const AddMoneyHistoryControllers = {
  createAddMoneyHistory,
  getAddMoneyHistory,
}
