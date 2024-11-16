import express from 'express'
import requireAuth from '../../middleware/requireAuth'
import { ShareHolderController } from './share_holder.controller'
import { Roles } from '../shared/user.enumeration'
import validateRequest from '../../middleware/validateRequest'
import { shareHolderProfitSchema } from './share_holder.schema'

const router = express.Router()

router.get('/', requireAuth(), ShareHolderController.getShareHolderPaymentQuery)

router.post(
  '/send-share-holder-profit',
  requireAuth(Roles.SUPER_ADMIN, Roles.ADMIN),
  validateRequest(shareHolderProfitSchema),
  ShareHolderController.sendShareHolderProfit,
)

export const ShareHolderRoutes = router
