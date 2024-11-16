import express from 'express'
import requireAuth from '../../middleware/requireAuth'
import { WalletController } from './wallet.controller'
import { Roles } from '../shared/user.enumeration'
import validateRequest from '../../middleware/validateRequest'
import { shareHolderProfitSchema } from './wallet.schema'

const router = express.Router()

router.get(
  '/share-holder',
  requireAuth(),
  WalletController.getShareHolderPaymentQuery,
)

router.post(
  '/send-share-holder-profit',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  validateRequest(shareHolderProfitSchema),
  WalletController.sendShareHolderProfit,
)

router.get(
  '/directorship',
  requireAuth(),
  WalletController.getDirectorshipPaymentQuery,
)

router.post(
  '/send-directorship-profit',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  validateRequest(shareHolderProfitSchema),
  WalletController.sendDirectorshipProfit,
)

export const WalletRoutes = router
