import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoney } from './add_money.interface'
import { AddMoneyModel } from './add_money.model'
import { UserModel } from '../user/user.model'

const createAddMoney = async (addMoneyData: IAddMoney) => {
  const user = await UserModel.findOne({
    _id: addMoneyData.userId,
  })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const userAccountable = await AddMoneyModel.findOne({
    userId: addMoneyData.userId,
  })

  const currentAccountable = {
    total_project: addMoneyData.total_project,
    total_project_amount: addMoneyData.total_project * 10000,
    fixed_deposit: addMoneyData.fixed_deposit,
    share_holder: addMoneyData.share_holder,
    directorship: addMoneyData.directorship,
    total_amount:
      addMoneyData.total_project * 10000 +
      addMoneyData.fixed_deposit +
      addMoneyData.share_holder +
      addMoneyData.directorship,
    total_point:
      addMoneyData.total_project * 10000 +
      addMoneyData.fixed_deposit +
      addMoneyData.share_holder +
      addMoneyData.directorship,
  }

  if (!userAccountable) {
    const newAddMoneyRecord = new AddMoneyModel({
      userId: addMoneyData.userId,
      ...currentAccountable,
      user_accountable: [currentAccountable],
    })
    return await newAddMoneyRecord.save()
  } else {
    userAccountable.total_project += currentAccountable.total_project
    userAccountable.total_project_amount! +=
      currentAccountable.total_project_amount
    userAccountable.fixed_deposit += currentAccountable.fixed_deposit
    userAccountable.share_holder += currentAccountable.share_holder
    userAccountable.directorship += currentAccountable.directorship
    userAccountable.total_amount! += currentAccountable.total_amount!
    userAccountable.total_point! += currentAccountable.total_point!
    if (user) {
      user.accountable = {
        total_project: userAccountable.total_project,
        total_project_amount: userAccountable.total_project_amount,
        fixed_deposit: userAccountable.fixed_deposit,
        share_holder: userAccountable.share_holder,
        directorship: userAccountable.directorship,
        total_amount: userAccountable.total_amount,
        total_point: userAccountable.total_point,
      }
      await user.save()
    }

    userAccountable.user_accountable.concat([currentAccountable])
    return await userAccountable.save()
  }
}

export const AddMoneyServices = {
  createAddMoney,
}
