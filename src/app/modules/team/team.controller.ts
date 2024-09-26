/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { SUCCESS } from '../shared/api.response.types'
import { TeamServices } from './team.service'
import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { ITeam } from './team.interface'

const getTeamMember = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params
    const team: ITeam = await TeamServices.getTeamMembers(userId)
    return SUCCESS(res, httpStatus.OK, 'Team fetched successfully', team)
  },
  httpStatus.INTERNAL_SERVER_ERROR,
  'Failed to fetch team',
)

export const TeamControllers = {
  getTeamMember,
}
