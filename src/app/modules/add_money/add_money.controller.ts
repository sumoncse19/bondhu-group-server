import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'
import { AddMoneyServices } from './add_money.service'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { IAddMoney, IRequestAddMoney } from './add_money.interface'

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

const getAllRequestedAddMoney = catchAsync(
  async (req: Request, res: Response) => {
    const { page = '1', limit = '10' } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const addMoneyHistory = await AddMoneyServices.getRequestedAddMoney(
      pageNum,
      limitNum,
    )

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get all requested add money successfully!',
      addMoneyHistory,
    )
  },
)

const requestAddMoney = catchAsync(
  async (req: Request, res: Response) => {
    const addMoneyData: IRequestAddMoney = req.body
    const newAddMoneyRequest =
      await AddMoneyServices.requestAddMoney(addMoneyData)
    return SUCCESS(
      res,
      httpStatus.CREATED,
      'Request for add money confirmation!',
      newAddMoneyRequest,
    )
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to request add money confirmation',
)

const approveAddMoney = catchAsync(async (req: Request, res: Response) => {
  const { requestAddMoneyId } = req.params

  const updatedAddMoney =
    await AddMoneyServices.approveAddMoney(requestAddMoneyId)

  return SUCCESS(
    res,
    httpStatus.OK,
    'Requested money approved successfully',
    updatedAddMoney,
  )
})

const rejectAddMoney = catchAsync(async (req: Request, res: Response) => {
  const { requestAddMoneyId } = req.params
  const updatedAddMoney =
    await AddMoneyServices.rejectAddMoney(requestAddMoneyId)

  return SUCCESS(
    res,
    httpStatus.OK,
    'Requested money rejected successfully',
    updatedAddMoney,
  )
})

const sendClubBonus = catchAsync(async (req: Request, res: Response) => {
  const { date } = req.query
  const addMoneyHistories = await AddMoneyServices.sendClubBonus(date as string)
  return SUCCESS(
    res,
    httpStatus.OK,
    'Club bonus sent successfully',
    addMoneyHistories,
  )
})

export const AddMoneyControllers = {
  createAddMoney,
  getAllRequestedAddMoney,
  requestAddMoney,
  approveAddMoney,
  rejectAddMoney,
  sendClubBonus,
}
