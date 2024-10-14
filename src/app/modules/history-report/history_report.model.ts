import { model, Schema, Document } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'
import {
  IAddMoneyHistory,
  IReferralBonusHistory,
} from './history_report.interface'

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
    payment_picture: { type: String },
    picture: { type: String },
    is_approved: { type: Boolean, required: true },
    date: { type: String },
  },
  {
    timestamps: true,
  },
)

const ReferralAmountHistorySchema: Schema = new Schema({
  bonus_from: { type: Schema.Types.ObjectId, required: true },
  reference_bonus_amount: { type: Number, required: true },
  type: { type: String },
  date: { type: String },
})

const ReferralBonusHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  total_referral_history: { type: Number },
  referral_bonus_history: [ReferralAmountHistorySchema],
})

// Export the AddMoney model
export const AddMoneyHistoryModel = model<IAddMoneyHistory & Document>(
  'AddMoneyHistory',
  AddMoneyHistorySchema,
)

// Export the ReferralBonus model
export const ReferralBonusHistoryModel = model<
  IReferralBonusHistory & Document
>('ReferralBonusHistory', ReferralBonusHistorySchema)
