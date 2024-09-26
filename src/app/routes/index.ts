import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.routes'
import { TeamRoutes } from '../modules/team/team.routes'

const router = Router()

const moduleRoutes = [
  {
    path: '/auth',
    route: UserRoutes,
  },
  {
    path: '/team',
    route: TeamRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
