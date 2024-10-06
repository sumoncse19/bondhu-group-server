import { model, Schema, Document } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'
import { IAddMoneyHistory } from './add_money_history.interface'

const AddMoneyHistorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    project_share: { type: Number, required: true },
    fixed_deposit: { type: Number, required: true },
    share_holder: { type: Number, required: true },
    directorship: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    money_receipt_number: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    payment_method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    bank_name: { type: String },
    bank_account_name: { type: String },
    branch_name: { type: String },
    transaction_id: { type: String, required: true, unique: true },
    picture: { type: String },
    date: { type: String },
  },
  {
    timestamps: true,
  },
)

// Export the AddMoney model
export const AddMoneyHistoryModel = model<IAddMoneyHistory & Document>(
  'AddMoneyHistory',
  AddMoneyHistorySchema,
)
