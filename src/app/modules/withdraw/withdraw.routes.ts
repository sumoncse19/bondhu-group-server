import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { withdrawMoneySchema } from './withdraw.schema'
import { WithdrawMoneyControllers } from './withdraw.controller'
import { Roles } from '../shared/user.enumeration'

const router = express.Router()

router.post(
  '/',
  requireAuth(),
  validateRequest(withdrawMoneySchema),
  WithdrawMoneyControllers.withdrawMoneyRequest,
)

router.post(
  '/approve/:withdrawId',
  requireAuth(Roles.SUPER_ADMIN || Roles.ADMIN),
  WithdrawMoneyControllers.approveWithdrawMoneyRequest,
)

router.get(
  '/get-all-requested-withdraw',
  requireAuth(Roles.SUPER_ADMIN || Roles.ADMIN),
  WithdrawMoneyControllers.getAllRequestedWithdraw,
)

export const WithdrawMoneyRoutes = router