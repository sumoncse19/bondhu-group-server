import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { HistoryControllers } from './history_report.controller'
import { addMoneyHistorySchema } from './history_report.schema'

const router = express.Router()

router.post(
  '/',
  requireAuth(),
  validateRequest(addMoneyHistorySchema),
  HistoryControllers.createAddMoneyHistory,
)

router.get(
  '/get-purchase-history/:userId',
  requireAuth(),
  HistoryControllers.getPurchaseHistory,
)

router.get(
  '/get-add-money-history/:userId',
  requireAuth(),
  HistoryControllers.getAddMoneyHistory,
)

router.get(
  '/get-referral-history/:userId',
  requireAuth(),
  HistoryControllers.getReferralBonusHistory,
)

export const HistoryRoutes = router
