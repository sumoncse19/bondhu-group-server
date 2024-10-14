import { model, Schema, Document } from 'mongoose'
import { IAddMoney } from './add_money.interface'
import { PaymentMethod } from '../shared/add_money.enumeration'

const AddMoneyHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  project_share: { type: Number, required: true },
  fixed_deposit: { type: Number, required: true },
  share_holder: { type: Number, required: true },
  directorship: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  money_receipt_number: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  payment_method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  bank_name: { type: String },
  bank_account_name: { type: String },
  branch_name: { type: String },
  transaction_id: { type: String, unique: true, required: true },
  payment_picture: { type: String },
  picture: { type: String },
  is_approved: { type: Boolean },
})

const AddMoneySchema: Schema = new Schema<IAddMoney>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    project_share: { type: Number, required: true },
    fixed_deposit: { type: Number, required: true },
    share_holder: { type: Number, required: true },
    directorship: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    total_point: { type: Number, default: 0 },

    money_receipt_number: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    payment_method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    bank_name: { type: String },
    bank_account_name: { type: String },
    branch_name: { type: String },
    transaction_id: { type: String, unique: true, required: true },
    payment_picture: { type: String },
    picture: { type: String },
    is_approved: { type: Boolean },
    add_money_history: [AddMoneyHistorySchema],
  },
  {
    timestamps: true,
  },
)

// Export the AddMoney model
export const AddMoneyModel = model<IAddMoney & Document>(
  'AddMoney',
  AddMoneySchema,
)
