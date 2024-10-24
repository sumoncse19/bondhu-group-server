import { Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import httpStatus from 'http-status'
import { SUCCESS } from '../shared/api.response.types'
import { WithdrawServices } from './withdraw.service'

const withdrawMoneyRequest = catchAsync(
  async (req: Request, res: Response) => {
    const withdrawData = req.body
    const withdrawResult =
      await WithdrawServices.requestForWithdraw(withdrawData)
    return SUCCESS(
      res,
      httpStatus.CREATED,
      'Withdraw Money created successfully',
      withdrawResult,
    )
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to Withdraw Money',
)

const approveWithdrawMoneyRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { withdrawId } = req.params

    const updatedUser =
      await WithdrawServices.approveWithdrawMoneyRequest(withdrawId)

    return SUCCESS(
      res,
      httpStatus.OK,
      'Requested money approved successfully',
      updatedUser,
    )
  },
)

const getAllRequestedWithdraw = catchAsync(
  async (req: Request, res: Response) => {
    const { page = '1', limit = '10' } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    const allRequestedWithdraw =
      await WithdrawServices.getAllRequestedWithdrawFromDB(pageNum, limitNum)

    return SUCCESS(
      res,
      httpStatus.OK,
      'Get all requested withdraw successfully',
      allRequestedWithdraw,
    )
  },
)

export const WithdrawMoneyControllers = {
  withdrawMoneyRequest,
  approveWithdrawMoneyRequest,
  getAllRequestedWithdraw,
}
