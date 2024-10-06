import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { AddMoneyHistoryControllers } from './add_money_history.controller'
import { addMoneyHistorySchema } from './add_money_history.schema'

const router = express.Router()

router.post(
  '/',
  requireAuth(),
  validateRequest(addMoneyHistorySchema),
  AddMoneyHistoryControllers.createAddMoneyHistory,
)

router.get(
  '/get-history/:userId',
  requireAuth(),
  AddMoneyHistoryControllers.getAddMoneyHistory,
)

export const AddMoneyHistoryRoutes = router
