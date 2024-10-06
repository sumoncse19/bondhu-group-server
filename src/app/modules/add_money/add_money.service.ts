import AppError from '../shared/errors/AppError'
import httpStatus from 'http-status'
import { IAddMoney } from './add_money.interface'
import { AddMoneyModel } from './add_money.model'
import { UserModel } from '../user/user.model'
import { AddMoneyHistoryModel } from '../add_money_history/add_money_history.model'

const createAddMoney = async (addMoneyData: IAddMoney) => {
  const user = await UserModel.findOne({
    _id: addMoneyData.userId,
  })
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found')

  const userAccountable = await AddMoneyModel.findOne({
    userId: addMoneyData.userId,
  })

  const currentAccountable = {
    userId: addMoneyData.userId,
    project_share: addMoneyData.project_share,
    fixed_deposit: addMoneyData.fixed_deposit,
    share_holder: addMoneyData.share_holder,
    directorship: addMoneyData.directorship,
    total_amount: addMoneyData.total_amount,
    money_receipt_number: addMoneyData.money_receipt_number,
    phone: addMoneyData.phone,
    payment_method: addMoneyData.payment_method,
    bank_name: addMoneyData.bank_name,
    bank_account_name: addMoneyData.bank_account_name,
    branch_name: addMoneyData.branch_name,
    transaction_id: addMoneyData.transaction_id,
    picture: addMoneyData.picture,
    date: new Date().toString(),
  }

  if (!userAccountable) {
    const addMoneyHistory = new AddMoneyHistoryModel(currentAccountable)
    await addMoneyHistory.save()

    const newAddMoneyRecord = new AddMoneyModel({
      ...currentAccountable,
    })
    return await newAddMoneyRecord.save()
  } else {
    userAccountable.project_share += currentAccountable.project_share
    userAccountable.fixed_deposit += currentAccountable.fixed_deposit
    userAccountable.share_holder += currentAccountable.share_holder
    userAccountable.directorship += currentAccountable.directorship
    userAccountable.total_amount += currentAccountable.total_amount
    userAccountable.total_point = userAccountable.total_amount
    userAccountable.money_receipt_number =
      currentAccountable.money_receipt_number
    userAccountable.phone = currentAccountable.phone
    userAccountable.payment_method = currentAccountable.payment_method
    userAccountable.bank_name = currentAccountable.bank_name
    userAccountable.bank_account_name = currentAccountable.bank_account_name
    userAccountable.branch_name = currentAccountable.branch_name
    userAccountable.transaction_id = currentAccountable.transaction_id
    userAccountable.picture = currentAccountable.picture
    userAccountable.date = new Date().toString()

    // add final account balance data in user model
    if (user) {
      user.accountable = {
        project_share: userAccountable.project_share,
        fixed_deposit: userAccountable.fixed_deposit,
        share_holder: userAccountable.share_holder,
        directorship: userAccountable.directorship,
        total_amount: userAccountable.total_amount,
        total_point: userAccountable.total_point,
      }
      await user.save()
    }

    const addMoneyHistory = new AddMoneyHistoryModel(currentAccountable)
    await addMoneyHistory.save()

    const userAddMoneyHistory = await AddMoneyHistoryModel.find({
      userId: addMoneyData.userId,
    })

    userAccountable.add_money_history = userAddMoneyHistory
    return await userAccountable.save()
  }
}

export const AddMoneyServices = {
  createAddMoney,
}
