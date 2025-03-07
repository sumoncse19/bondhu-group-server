import express from 'express'
import requireAuth from '../../middleware/requireAuth'
import { WalletController } from './wallet.controller'
import { Roles } from '../shared/user.enumeration'
import validateRequest from '../../middleware/validateRequest'
import { shareHolderProfitSchema } from './wallet.schema'

const router = express.Router()

router.get(
  '/project-share',
  requireAuth(),
  WalletController.getProjectSharePaymentQuery,
)

router.post(
  '/send-single-project-share/:project_share_payment_id',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  WalletController.sendSingleProjectShareProfit,
)

router.post(
  '/send-selected-project-share',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  WalletController.sendSelectedProjectShareProfit,
)

router.get(
  '/fixed-deposit',
  requireAuth(),
  WalletController.getFixedDepositPaymentQuery,
)

router.post(
  '/send-single-fixed-deposit/:fixed_deposit_payment_id',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  WalletController.sendSingleFixedDepositProfit,
)

router.post(
  '/send-selected-fixed-deposit',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  WalletController.sendSelectedFixedDepositProfit,
)

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
