import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { PurchaseMoneyControllers } from './purchase.controller'
import { purchaseMoneySchema } from './purchase.schema'

const router = express.Router()

router.post(
  '/',
  requireAuth(),
  validateRequest(purchaseMoneySchema),
  PurchaseMoneyControllers.purchaseMoney,
)

export const PurchaseMoneyRoutes = router
