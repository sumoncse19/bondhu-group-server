import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import notFound from './app/middleware/notFound'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import router from './app/routes'

const app: Application = express()

//parser
app.use(express.json())
app.use(cors())

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
export default app
