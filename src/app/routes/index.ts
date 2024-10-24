import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.routes'
import { TeamRoutes } from '../modules/team/team.routes'
import { AddMoneyRoutes } from '../modules/add_money/add_money.routes'
import { PurchaseMoneyRoutes } from '../modules/purchase/purchase.routes'
import { HistoryRoutes } from '../modules/history-report/history_report.routes'
import { WithdrawMoneyRoutes } from '../modules/withdraw/withdraw.routes'

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
    path: '/history',
    route: HistoryRoutes,
  },
  {
    path: '/purchase',
    route: PurchaseMoneyRoutes,
  },
  {
    path: '/withdraw',
    route: WithdrawMoneyRoutes,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
