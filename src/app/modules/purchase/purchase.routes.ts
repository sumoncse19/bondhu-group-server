import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { PurchaseMoneyControllers } from './purchase.controller'
import { purchaseMoneySchema } from './purchase.schema'
import { Roles } from '../shared/user.enumeration'

const router = express.Router()

router.post(
  '/',
  requireAuth(Roles.SUPER_ADMIN),
  validateRequest(purchaseMoneySchema),
  PurchaseMoneyControllers.purchaseMoney,
)
router.get(
  '/get-all-purchase-history',
  requireAuth(),
  PurchaseMoneyControllers.getAllPurchaseHistory,
)
export const PurchaseMoneyRoutes = router
