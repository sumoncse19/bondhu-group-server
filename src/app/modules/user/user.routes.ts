import express from 'express'
import { UserControllers } from './user.controller'

import { registerSchema, loginSchema } from './user.schema'
import validateRequest from '../../middleware/validateRequest'
import { Roles } from '../shared/user.enumeration'
import requireAuth from '../../middleware/requireAuth'

const router = express.Router()

router.post(
  '/auth/register',
  validateRequest(registerSchema),
  UserControllers.registerUser,
)
router.post(
  '/auth/login',
  validateRequest(loginSchema),
  UserControllers.loginUser,
)
router.get('/get-user/:userId', requireAuth(), UserControllers.getUser)
router.get(
  '/get-all-users/',
  requireAuth(Roles.SUPER_ADMIN || Roles.ADMIN),
  UserControllers.getAllUser,
)
router.get(
  '/get-referred-user/:userId',
  requireAuth(),
  UserControllers.getAllReferredUser,
)

export const UserRoutes = router
