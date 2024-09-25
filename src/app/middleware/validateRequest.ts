/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodEffects } from 'zod'
import { ERROR } from '../modules/shared/api.response.types'
import httpStatus from 'http-status'

const validateRequest = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actualSchema =
        schema instanceof ZodEffects ? schema._def.schema : schema

      await actualSchema.parseAsync(req.body)
      next()
    } catch (err) {
      if (err instanceof Error) {
        return ERROR(
          res,
          httpStatus.BAD_REQUEST,
          'Validation error',
          (err as any).errors || [{ message: err.message }],
          err.stack,
        )
      }
    }
  }
}

export default validateRequest
