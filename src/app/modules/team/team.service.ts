import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { ITeamMember } from './team.interface'
import { UserModel } from '../user/user.model'

const getAllChildUsersFromDB = async (
  userId: string,
): Promise<ITeamMember[]> => {
  const users: ITeamMember[] = await UserModel.find({})
    .select(
      '_id name user_name role phone reference_id parent_placement_id wallet accountable left_side_partner right_side_partner',
    )
    .lean()

  if (!users || users.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No users found')
  }

  const childUsers: ITeamMember[] = []

  const addYourChildren = (
    childrenId: ITeamMember | object | string | null | undefined,
  ) => {
    if (!childrenId) return null
    if (childrenId) {
      const foundUser = users.find((user) => user._id.toString() === childrenId)
      if (foundUser) {
        childUsers.push(foundUser)
        addYourChildren(foundUser.left_side_partner)
        addYourChildren(foundUser.right_side_partner)
      }
    }
  }

  const selectedUser = users.find((user) => user._id.toString() === userId)

  if (!selectedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'There is no user with this ID')
  }

  childUsers.push(selectedUser)
  addYourChildren(selectedUser.left_side_partner)
  addYourChildren(selectedUser.right_side_partner)

  return childUsers
}

const getTeamMembers = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .select(
      '_id name picture email reference_id parent_placement_id wallet left_side_partner right_side_partner',
    )
    .lean()

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const buildTeamTree = async (
    userId: string | object | null,
    countTeamMemberIndex: number,
  ): Promise<ITeamMember | string | null> => {
    if (!userId) return null

    const member = await UserModel.findById(userId)
      .select(
        '_id name picture email reference_id parent_placement_id wallet left_side_partner right_side_partner',
      )
      .lean()

    if (!member) return null

    return {
      _id: member._id,
      name: member.name,
      user_name: member.user_name,
      phone: member.phone,
      picture: member.picture,
      email: member.email,
      reference_id: member.reference_id,
      parent_placement_id: member.parent_placement_id,
      wallet: member.wallet,
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
    user_name: user.user_name,
    phone: user.phone,
    picture: user.picture,
    email: user.email,
    reference_id: user.reference_id,
    parent_placement_id: user.parent_placement_id,
    wallet: user.wallet,
    left_side_partner: await buildTeamTree(user.left_side_partner, 1),
    right_side_partner: await buildTeamTree(user.right_side_partner, 1),
  }

  return team
}

export const TeamServices = {
  getAllChildUsersFromDB,
  getTeamMembers,
}
