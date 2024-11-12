import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import notFound from './app/middleware/notFound'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import router from './app/routes'
import redisClient from './app/config/redis.config'
import catchAsync from './app/utils/catchAsync'
import httpStatus from 'http-status'

const app: Application = express()

//parser
app.use(express.json())
app.use(
  cors({
    origin: true, // Allow all origins temporarily
    credentials: true, // Enable credentials
  }),
)

const getAController = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message:
      'Your Mongoose Starter system server is running and you hit the / route!',
  })
}

app.get('/', getAController)

// application routes
app.use('/api/v1', router)

// Global error handling
app.use(globalErrorHandler)

// Not found route
app.use(notFound)

// Example of using Redis with catchAsync
app.get(
  '/test-redis',
  catchAsync(
    async (req: Request, res: Response) => {
      await redisClient.set('test', 'Hello Redis')
      const value = await redisClient.get('test')
      res.json({ value })
    },
    httpStatus.INTERNAL_SERVER_ERROR,
    'Redis operation failed',
  ),
)

export default app
