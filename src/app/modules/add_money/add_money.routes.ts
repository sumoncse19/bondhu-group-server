import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import requireAuth from '../../middleware/requireAuth'
import { AddMoneyControllers } from './add_money.controller'
import { addMoneySchema } from './add_money.schema'

const router = express.Router()

router.post(
  '/',
  requireAuth(),
  validateRequest(addMoneySchema),
  AddMoneyControllers.createAddMoney,
)

export const AddMoneyRoutes = router
