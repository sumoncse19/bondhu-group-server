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
  '/get-add-money-history/:userId',
  requireAuth(),
  AddMoneyHistoryControllers.getAddMoneyHistory,
)

router.get(
  '/get-referral-history/:userId',
  requireAuth(),
  AddMoneyHistoryControllers.getReferralBonusHistory,
)

export const HistoryRoutes = router
