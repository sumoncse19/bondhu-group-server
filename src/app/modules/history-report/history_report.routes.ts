import express from 'express'
import requireAuth from '../../middleware/requireAuth'
import { HistoryControllers } from './history_report.controller'

const router = express.Router()

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
  '/get-matching-history/:userId',
  requireAuth(),
  HistoryControllers.getMatchingBonusHistory,
)

router.get(
  '/get-referral-history/:userId',
  requireAuth(),
  HistoryControllers.getReferralBonusHistory,
)

export const HistoryRoutes = router
