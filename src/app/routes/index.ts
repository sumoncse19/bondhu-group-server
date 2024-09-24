import { Router } from 'express'
import { UserRoutes } from '../modules/user/user.routes'
// import { ServiceRoutes } from '../modules/service/service.routes'
// import { SlotRoutes } from '../modules/slot/slot.routes'
// import { BookingRoutes } from '../modules/booking/booking.routes'
// import { MyBookingsRoutes } from '../modules/booking/my-bookings'

const router = Router()

const moduleRoutes = [
  {
    path: '/auth',
    route: UserRoutes,
  },
  // {
  //   path: '/services',
  //   route: ServiceRoutes,
  // },
  // {
  //   path: '/slots',
  //   route: SlotRoutes,
  // },
  // {
  //   path: '/bookings',
  //   route: BookingRoutes,
  // },
  // {
  //   path: '/my-bookings',
  //   route: MyBookingsRoutes,
  // },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
