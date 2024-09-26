import { Schema, model } from 'mongoose'
import { ITeam, ITeamMember } from './team.interface'

const teamMemberSchema = new Schema<ITeamMember>({
  _id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  picture: { type: String, required: true },
  email: { type: String, required: true },
  reference_id: { type: Schema.Types.ObjectId, required: true },
  parent_placement_id: { type: Schema.Types.ObjectId, required: true },
  left_side_partner: {
    type: Schema.Types.Mixed,
    ref: 'TeamMember',
    default: null,
  },
  right_side_partner: {
    type: Schema.Types.Mixed,
    ref: 'TeamMember',
    default: null,
  },
})

const teamSchema = new Schema<ITeam>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    picture: { type: String, required: true },
    email: { type: String, required: true },
    reference_id: { type: Schema.Types.ObjectId, required: true },
    parent_placement_id: { type: Schema.Types.ObjectId, required: true },
    left_side_partner: {
      type: teamMemberSchema,
      default: null,
    },
    right_side_partner: {
      type: teamMemberSchema,
      default: null,
    },
  },
  { timestamps: true },
)

export const TeamModel = model<ITeam>('Team', teamSchema)
