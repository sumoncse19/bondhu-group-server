import { z } from 'zod'

// Define the type first to break the circular dependency issue
type TeamMemberType = {
  _id: string
  name: string
  picture?: string
  email: string
  left_side_partner: TeamMemberType | null
  right_side_partner: TeamMemberType | null
}

// Recursive schema for team members (including partners with nested partners)
export const teamMemberSchema: z.ZodSchema<TeamMemberType> = z.object({
  _id: z.string().min(1, 'ID is required'),
  name: z.string().min(2, 'Name is required'),
  picture: z.string().url('Invalid picture URL').optional(),
  email: z.string().email('Invalid email address'),
  reference_id: z.string().min(1, 'Invalid reference id'),
  parent_placement_id: z.string().min(1, 'Invalid parent placement id'),
  left_side_partner: z.lazy(() => teamMemberSchema.nullable()),
  right_side_partner: z.lazy(() => teamMemberSchema.nullable()),
})

// Schema for the team, including team leader and nested team members
export const teamSchema = z.object({
  _id: z.string().min(1, 'Team leader ID is required'),
  name: z.string().min(2, 'Team leader name is required'),
  picture: z.string().url('Invalid picture URL').optional(),
  email: z.string().email('Invalid email address'),
  reference_id: z.string().min(1, 'Invalid reference id'),
  parent_placement_id: z.string().min(1, 'Invalid parent placement id'),
  left_side_partner: z.lazy(() => teamMemberSchema.nullable()),
  right_side_partner: z.lazy(() => teamMemberSchema.nullable()),
})

// Schema for validating the user ID when fetching team data
export const getTeamSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})
