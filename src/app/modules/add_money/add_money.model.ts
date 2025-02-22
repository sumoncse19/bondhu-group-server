import { model, Schema, Document } from 'mongoose'
import { IAddMoney, IRequestAddMoney } from './add_money.interface'
import { PaymentMethod } from '../shared/add_money.enumeration'

const AddMoneyHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  user_name: { type: String, required: true },
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
  account_no: { type: String },
  transaction_id: { type: String },
  payment_picture: { type: String },
  picture: { type: String },
  date: { type: String, required: true },
  is_reject: { type: Boolean, default: false },
  is_approved: { type: Boolean, default: false },
})

const AddMoneySchema: Schema = new Schema<IAddMoney>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    user_name: { type: String, required: true },
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
    account_no: { type: String },
    transaction_id: { type: String },
    payment_picture: { type: String },
    picture: { type: String },
    date: { type: String, required: true },
    is_reject: { type: Boolean, default: false },
    is_approved: { type: Boolean, default: false },
    add_money_history: [AddMoneyHistorySchema],
  },
  {
    timestamps: true,
  },
)

const RequestAddMoneySchema: Schema = new Schema<IRequestAddMoney>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    user_name: { type: String, required: true },
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
    account_no: { type: String },
    transaction_id: { type: String },
    payment_picture: { type: String },
    picture: { type: String },
    date: { type: String, required: true },
    is_reject: { type: Boolean, default: false },
    is_approved: { type: Boolean, default: false },
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

export const RequestAddMoneyModel = model<IRequestAddMoney & Document>(
  'RequestAddMoney',
  RequestAddMoneySchema,
)
