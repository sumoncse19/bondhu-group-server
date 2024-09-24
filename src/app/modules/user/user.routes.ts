import express from 'express'
import { UserControllers } from './user.controller'

import { registerSchema, loginSchema } from './user.schema'
import validateRequest from '../../middleware/validateRequest'

const router = express.Router()

router.post(
  '/register',
  validateRequest(registerSchema),
  UserControllers.registerUser,
)
router.post('/login', validateRequest(loginSchema), UserControllers.loginUser)

export const UserRoutes = router
