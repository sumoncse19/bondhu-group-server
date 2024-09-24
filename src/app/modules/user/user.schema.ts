import { z } from 'zod'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  father_or_husband_name: z.string().optional(),
  mother_name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum([Roles.ADMIN, Roles.USER]),
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  blood_group: z.string().optional(),
  nid_passport_no: z.string().min(5, 'Nid or Password is required'),
  dob: z.string(),
  choice_side: z.enum([Sides.A, Sides.B]),
  marital_status: z
    .enum([MaritalStatus.SINGLE, MaritalStatus.MARRIED])
    .optional(),
  profession: z.string().optional(),
  reference_id: z.string().min(1, 'Reference ID is required'),
  placement_id: z.string().min(1, 'Placement ID is required'),
  nominee_name: z.string().min(3, 'Nominee is required'),
  relation_with_nominee: z.string().optional(),
  nominee_address: z.string().optional(),
  nominee_mobile_no: z.string().min(8, 'Nominee  mobile number is required'),
  nominee_picture: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})
