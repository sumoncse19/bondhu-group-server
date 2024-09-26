import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { ITeamMember } from './team.interface'
import { UserModel } from '../user/user.model'

const getTeamMembers = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .select(
      '_id name picture email reference_id parent_placement_id left_side_partner right_side_partner',
    )
    .lean()

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const buildTeamTree = async (
    userId: string | null,
    countTeamMemberIndex: number,
  ): Promise<ITeamMember | string | null> => {
    if (!userId) return null

    const member = await UserModel.findById(userId)
      .select(
        '_id name picture email reference_id parent_placement_id left_side_partner right_side_partner',
      )
      .lean()

    if (!member) return null

    return {
      _id: member._id,
      name: member.name,
      picture: member.picture,
      email: member.email,
      reference_id: member.reference_id,
      parent_placement_id: member.parent_placement_id,
      left_side_partner:
        countTeamMemberIndex < 2
          ? await buildTeamTree(
              member.left_side_partner,
              countTeamMemberIndex + 1,
            )
          : member.left_side_partner,
      right_side_partner:
        countTeamMemberIndex < 2
          ? await buildTeamTree(
              member.right_side_partner,
              countTeamMemberIndex + 1,
            )
          : member.left_side_partner,
    }
  }

  const team = {
    _id: user._id,
    name: user.name,
    picture: user.picture,
    email: user.email,
    reference_id: user.reference_id,
    parent_placement_id: user.parent_placement_id,
    left_side_partner: await buildTeamTree(user.left_side_partner, 1),
    right_side_partner: await buildTeamTree(user.right_side_partner, 1),
  }

  return team
}

export const TeamServices = {
  getTeamMembers,
}
