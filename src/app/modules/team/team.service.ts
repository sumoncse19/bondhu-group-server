import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { ITeamMember } from './team.interface'
import { UserModel } from '../user/user.model'
import mongoose from 'mongoose'

const getAllChildUsersFromDB = async (
  userId: string | object,
): Promise<ITeamMember[]> => {
  const users: ITeamMember[] = await UserModel.find({})
    .select(
      '_id name user_name role phone reference_id parent_placement_id wallet accountable designation left_side_partner right_side_partner is_approved',
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
    throw new AppError(
      httpStatus.NOT_FOUND,
      `There is no user with this ID ${userId}`,
    )
  }

  childUsers.push(selectedUser)
  addYourChildren(selectedUser.left_side_partner)
  addYourChildren(selectedUser.right_side_partner)

  return childUsers
}

const getTeamMembers = async (userId: string, search: string) => {
  const user = search
    ? await UserModel.findOne({ user_name: { $regex: search, $options: 'i' } })
        .select(
          '_id name user_name picture email phone reference_id parent_placement_id wallet accountable designation left_side_partner right_side_partner registration_date',
        )
        .lean()
    : await UserModel.findById(userId)
        .select(
          '_id name user_name picture email phone reference_id parent_placement_id wallet accountable designation left_side_partner right_side_partner registration_date',
        )
        .lean()

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }

  const isValidObjectId = (id: string | object | null): boolean => {
    if (!id) return false
    return mongoose.Types.ObjectId.isValid(id.toString())
  }

  const countTeamMember = async (userId: string | object | null) => {
    if (!userId || !isValidObjectId(userId)) return 0
    const totalTeamMembers = await getAllChildUsersFromDB(userId)
    return totalTeamMembers.length
  }

  const isLeftSidePartnerValid =
    user.left_side_partner && isValidObjectId(user.left_side_partner)
      ? (await UserModel.exists({ _id: user.left_side_partner })) !== null
      : false

  const isRightSidePartnerValid =
    user.right_side_partner && isValidObjectId(user.right_side_partner)
      ? (await UserModel.exists({ _id: user.right_side_partner })) !== null
      : false

  if (!isLeftSidePartnerValid && user.left_side_partner !== null) {
    user.left_side_partner = null
  }

  if (!isRightSidePartnerValid && user.right_side_partner !== null) {
    user.right_side_partner = null
  }

  user.accountable = {
    ...user.accountable,
    team_a_member: isLeftSidePartnerValid
      ? await countTeamMember(user.left_side_partner)
      : 0,
    team_b_member: isRightSidePartnerValid
      ? await countTeamMember(user.right_side_partner)
      : 0,
  }

  const buildTeamTree = async (
    userId: string | object | null,
    countTeamMemberIndex: number,
  ): Promise<ITeamMember | string | null> => {
    if (!userId || !isValidObjectId(userId)) return null

    const member = await UserModel.findById(userId)
      .select(
        '_id name user_name picture email phone reference_id parent_placement_id wallet accountable designation left_side_partner right_side_partner registration_date',
      )
      .lean()

    if (!member) return null

    const isLeftSidePartnerValid =
      member.left_side_partner && isValidObjectId(member.left_side_partner)
        ? (await UserModel.exists({ _id: member.left_side_partner })) !== null
        : false

    const isRightSidePartnerValid =
      member.right_side_partner && isValidObjectId(member.right_side_partner)
        ? (await UserModel.exists({ _id: member.right_side_partner })) !== null
        : false

    if (!isLeftSidePartnerValid && member.left_side_partner !== null) {
      member.left_side_partner = null
    }

    if (!isRightSidePartnerValid && member.right_side_partner !== null) {
      member.right_side_partner = null
    }

    member.accountable = {
      ...member.accountable,
      team_a_member: isLeftSidePartnerValid
        ? await countTeamMember(member.left_side_partner)
        : 0,
      team_b_member: isRightSidePartnerValid
        ? await countTeamMember(member.right_side_partner)
        : 0,
    }

    return {
      _id: member._id,
      name: member.name,
      user_name: member.user_name,
      phone: member.phone,
      picture: member.picture,
      email: member.email,
      designation: member.designation || '',
      reference_id: member.reference_id,
      parent_placement_id: member.parent_placement_id,
      wallet: member.wallet,
      accountable: member.accountable,
      left_side_partner:
        countTeamMemberIndex < 2 && isValidObjectId(member.left_side_partner)
          ? await buildTeamTree(
              member.left_side_partner,
              countTeamMemberIndex + 1,
            )
          : member.left_side_partner,
      right_side_partner:
        countTeamMemberIndex < 2 && isValidObjectId(member.right_side_partner)
          ? await buildTeamTree(
              member.right_side_partner,
              countTeamMemberIndex + 1,
            )
          : member.right_side_partner,
      registration_date: member.registration_date,
    }
  }

  const team = {
    _id: user._id,
    name: user.name,
    user_name: user.user_name,
    phone: user.phone,
    picture: user.picture,
    email: user.email,
    designation: user.designation,
    reference_id: user.reference_id,
    parent_placement_id: user.parent_placement_id,
    wallet: user.wallet,
    accountable: user.accountable,
    left_side_partner: await buildTeamTree(user.left_side_partner, 1),
    right_side_partner: await buildTeamTree(user.right_side_partner, 1),
    registration_date: user.registration_date,
  }

  return team
}

export const TeamServices = {
  getAllChildUsersFromDB,
  getTeamMembers,
}
