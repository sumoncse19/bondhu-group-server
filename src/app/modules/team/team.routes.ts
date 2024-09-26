import express from 'express'
import { TeamControllers } from './team.controller'
// import validateRequest from '../../middleware/validateRequest'
// import { teamSchema } from './team.schema'
import requireAuth from '../../middleware/requireAuth'
// import { Roles } from '../shared/user.enumeration'

const router = express.Router()

// Route to get team data for logged-in user
router.get(
  '/:userId',
  requireAuth(),
  // requireAuth(Roles.USER),
  // validateRequest(teamSchema),
  TeamControllers.getTeamMember,
)

export const TeamRoutes = router
