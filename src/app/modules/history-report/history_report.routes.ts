import express from 'express'
import requireAuth from '../../middleware/requireAuth'
import { HistoryControllers } from './history_report.controller'
import { Roles } from '../shared/user.enumeration'

const router = express.Router()

router.get(
  '/get-user-purchase-history/:userId',
  requireAuth(),
  HistoryControllers.getUserPurchaseHistory,
)

router.get(
  '/get-user-joining-cost-history/:userId',
  requireAuth(),
  HistoryControllers.getUserJoiningCostHistory,
)

router.get(
  '/get-all-add-money-history',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  HistoryControllers.getAllAddMoneyHistory,
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

router.get(
  '/get-club-bonus-history/:userId',
  requireAuth(),
  HistoryControllers.getClubBonusHistory,
)

router.get(
  '/get-send-club-bonus-by-date',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  HistoryControllers.getSendClubBonusByDate,
)

router.get(
  '/get-all-send-club-bonus-history',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  HistoryControllers.getAllSendClubBonusHistory,
)

export const HistoryRoutes = router
