import { z } from 'zod'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'
import { Types } from 'mongoose'
import { UserModel } from './user.model'

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    serial_number: z
      .string()
      .min(2, 'Serial number is required')
      .refine(
        async (value) => {
          const existing = await UserModel.findOne({ serial_number: value })
          return !existing
        },
        {
          message: 'Serial number must be unique.',
        },
      ),
    user_name: z
      .string()
      .min(2, 'User Name is required')
      .refine(
        async (value) => {
          const existing = await UserModel.findOne({ user_name: value })
          return !existing
        },
        {
          message: 'Username must be unique.',
        },
      ),
    registration_date: z.string().min(2, 'Registration date is required'),
    father_or_husband_name: z.string().optional(),
    mother_name: z.string().optional(),
    picture: z.string().optional(),
    cover_photo: z.string().optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
    phone: z
      .string()
      .min(11, 'Phone number is required and must be 11 character')
      .max(11, 'Phone number is required and must be 11 character')
      .refine(
        async (value) => {
          const existing = await UserModel.findOne({ phone: value })
          return !existing
        },
        {
          message: 'Phone number must be unique.',
        },
      ),
    role: z.enum([Roles.ADMIN, Roles.USER, Roles.SUPER_ADMIN]),
    present_address: z.string().optional(),
    permanent_address: z.string().optional(),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    blood_group: z.string().optional(),
    nid_passport_no: z.string().min(5, 'Nid or Password is required'),
    dob: z.string().optional(),
    choice_side: z.enum([Sides.A, Sides.B]),
    marital_status: z
      .enum([MaritalStatus.SINGLE, MaritalStatus.MARRIED])
      .optional(),
    profession: z.string().optional(),
    agent_id: z.string().optional(),
    reference_id: z.string(),
    parent_placement_id: z.string(),
    placement_id: z.string().optional(),
    nominee_name: z.string().min(3, 'Nominee is required'),
    relation_with_nominee: z.string().optional(),
    nominee_address: z.string().optional(),
    nominee_mobile_no: z.string().optional(),
    nominee_picture: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate parent_placement_id
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

    // Validate reference_id
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

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  serial_number: z.string().min(2, 'Serial number is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  user_name: z
    .string()
    .min(2, 'User Name must be at least 2 characters')
    .optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .optional(),
  registration_date: z
    .string()
    .min(2, 'Registration date is required')
    .optional(),
  father_or_husband_name: z.string().optional(),
  mother_name: z.string().optional(),
  picture: z.string().optional(),
  cover_photo: z.string().optional(),
  phone: z
    .string()
    .min(11)
    .max(11, 'Phone number must be 11 characters')
    .optional(),
  role: z.enum([Roles.ADMIN, Roles.USER, Roles.SUPER_ADMIN]).optional(),
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  blood_group: z.string().optional(),
  nid_passport_no: z.string().min(5, 'NID/Passport must be valid').optional(),
  dob: z.string().optional(),
  choice_side: z.enum([Sides.A, Sides.B]).optional(),
  marital_status: z
    .enum([MaritalStatus.SINGLE, MaritalStatus.MARRIED])
    .optional(),
  profession: z.string().optional(),
  bKash: z.string().optional(),
  rocket: z.string().optional(),
  nagad: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account_name: z.string().optional(),
  branch_name: z.string().optional(),
  account_no: z.string().optional(),
  routing_no: z.string().optional(),
  swift_code: z.string().optional(),
  designation: z.string().optional(),
  is_approved: z.boolean().optional(),
  nominee_name: z.string().optional(),
  relation_with_nominee: z.string().optional(),
  nominee_address: z.string().optional(),
  nominee_mobile_no: z.string().optional(),
  nominee_picture: z.string().optional(),
  note: z.string().optional(),
  note_image: z.string().optional(),
})

export const loginSchema = z.object({
  user_name: z.string().min(2, 'Invalid user name'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})
