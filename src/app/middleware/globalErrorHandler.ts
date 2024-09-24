/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import handleZodError from '../modules/shared/errors/zodErrorHandler'
import handleValidationError from '../modules/shared/errors/mongooseValidationErrorHandler'
import handleCastError from '../modules/shared/errors/mongooseCastErrorHandler'
import handleDuplicateError from '../modules/shared/errors/duplicateKeyErrorHandler'
import { ERROR } from '../modules/shared/api.response.types'
import httpStatus from 'http-status'

function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  let errorResponse

  if (err instanceof ZodError) {
    errorResponse = handleZodError(err)
  } else if (err instanceof mongoose.Error.ValidationError) {
    errorResponse = handleValidationError(err)
  } else if (err instanceof mongoose.Error.CastError) {
    errorResponse = handleCastError(err)
  } else if (err.code && err.code === 11000) {
    errorResponse = handleDuplicateError(err)
  } else {
    errorResponse = {
      success: false,
      statusCode: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      message: err.message || 'Internal server error',
      errors: [],
      stack: err.stack,
    }
  }

  //ERROR function to send the error response
  ERROR(res, errorResponse.statusCode, errorResponse.message, [
    ...(errorResponse.errors || []),
    errorResponse.stack,
  ])
}

export default globalErrorHandler
