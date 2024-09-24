import { z } from 'zod'
import { Roles } from '../shared/user.enumeration'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum([Roles.ADMIN, Roles.USER]),
  address: z.string().min(1, 'Address is required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})
