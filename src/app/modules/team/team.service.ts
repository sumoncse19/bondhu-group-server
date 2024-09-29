import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { ITeamMember } from './team.interface'
import { UserModel } from '../user/user.model'
import { IUser } from '../user/user.interface'
import { Types } from 'mongoose'

const getAllChildUsersFromDB = async (userId: string): Promise<IUser[]> => {
  interface IUserWithId extends IUser {
    _id: Types.ObjectId | string
  }

  const users: IUserWithId[] = await UserModel.find({})
    .select(
      '_id name user_name phone reference_id parent_placement_id left_side_partner right_side_partner',
    )
    .lean()

  if (!users || users.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No users found')
  }

  const childUsers: IUserWithId[] = []

  const addYourChildren = (childrenId: string | null) => {
    if (childrenId) {
      const foundUser = users.find((user) => user._id.toString() === childrenId)
      if (foundUser) {
        childUsers.push(foundUser)
        addYourChildren(foundUser.left_side_partner)
        addYourChildren(foundUser.right_side_partner)
      }
    }
  }

  const startingUser = users.find((user) => user._id.toString() === userId)

  if (!startingUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'There is no user with this ID')
  }

  childUsers.push(startingUser)
  addYourChildren(startingUser.left_side_partner)
  addYourChildren(startingUser.right_side_partner)

  return childUsers
}

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
  getAllChildUsersFromDB,
  getTeamMembers,
}
