/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'
import { AddMoneyServices } from './add_money.service'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { IAddMoney } from './add_money.interface'

const createAddMoney = catchAsync(
  async (req: Request, res: Response) => {
    const addMoneyData: IAddMoney = req.body
    const newAddMoney = await AddMoneyServices.createAddMoney(addMoneyData)
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

export const AddMoneyControllers = {
  createAddMoney,
}
