import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { AddMoneyControllers } from './add_money.controller'
import { addMoneySchema } from './add_money.schema'
import { Roles } from '../shared/user.enumeration'

const router = express.Router()

router.post(
  '/',
  requireAuth(),
  validateRequest(addMoneySchema),
  AddMoneyControllers.createAddMoney,
)

router.get(
  '/get-all-requested-add-money',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  AddMoneyControllers.getAllRequestedAddMoney,
)

router.post(
  '/new-request',
  requireAuth(),
  validateRequest(addMoneySchema),
  AddMoneyControllers.requestAddMoney,
)

router.post(
  '/approve/:requestAddMoneyId',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  AddMoneyControllers.approveAddMoney,
)

router.post(
  '/reject/:requestAddMoneyId',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  AddMoneyControllers.rejectAddMoney,
)

export const AddMoneyRoutes = router
