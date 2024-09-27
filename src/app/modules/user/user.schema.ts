import { z } from 'zod'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'
import { Types } from 'mongoose'

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    registration_date: z.string().min(2, 'Registration date is required'),
    father_or_husband_name: z.string().optional(),
    mother_name: z.string().optional(),
    picture: z.string().optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
    phone: z.string().min(1, 'Phone number is required'),
    role: z.enum([Roles.ADMIN, Roles.USER, Roles.SUPER_ADMIN]),
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
    reference_id: z.string(),
    parent_placement_id: z.string(),
    left_side_partner: z.string(),
    right_side_partner: z.string(),
    placement_id: z.string().optional(),
    nominee_name: z.string().min(3, 'Nominee is required'),
    relation_with_nominee: z.string().optional(),
    nominee_address: z.string().optional(),
    nominee_mobile_no: z.string().min(8, 'Nominee mobile number is required'),
    nominee_picture: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.role !== Roles.SUPER_ADMIN &&
      !Types.ObjectId.isValid(data.parent_placement_id)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['parent_placement_id'],
        message: 'Invalid parent placement ID. It must be a valid ObjectId.',
      })
    } else if (
      data.role === Roles.SUPER_ADMIN &&
      typeof data.parent_placement_id !== 'string'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['parent_placement_id'],
        message: 'For superAdmin, parent placement ID should be a string.',
      })
    }

    if (
      data.role !== Roles.SUPER_ADMIN &&
      !Types.ObjectId.isValid(data.reference_id)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['reference_id'],
        message: 'Invalid reference ID. It must be a valid ObjectId.',
      })
    } else if (
      data.role === Roles.SUPER_ADMIN &&
      typeof data.reference_id !== 'string'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['reference_id'],
        message: 'For superAdmin, reference ID should be a string.',
      })
    }
  })

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})
