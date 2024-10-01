import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.routes'
import { TeamRoutes } from '../modules/team/team.routes'
import { AddMoneyRoutes } from '../modules/add_money/add_money.routes'
import { PurchaseMoneyRoutes } from '../modules/purchase/purchase.routes'

const router = Router()

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/team',
    route: TeamRoutes,
  },
  {
    path: '/add-money',
    route: AddMoneyRoutes,
  },
  {
    path: '/purchase',
    route: PurchaseMoneyRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
