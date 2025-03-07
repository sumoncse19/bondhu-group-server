import { model, Schema, Document } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'
import {
  IAddMoneyHistory,
  IClubBonusHistory,
  IMatchingBonusHistory,
  IReferralBonusHistory,
  ISendClubBonusToday,
} from './history_report.interface'

const AddMoneyHistorySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    user_name: { type: String, required: true },
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
    account_no: { type: String },
    transaction_id: { type: String },
    payment_picture: { type: String },
    picture: { type: String },
    is_reject: { type: Boolean, default: false },
    is_approved: { type: Boolean, default: false },
    date: { type: String },
  },
  {
    timestamps: true,
  },
)

const MatchingAmountHistorySchema: Schema = new Schema({
  matching_bonus_amount: { type: Number, required: true },
  type: { type: String },
  date: { type: String },
})

const MatchingBonusHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  total_matching_history: { type: Number },
  matching_bonus_history: [MatchingAmountHistorySchema],
})

const ReferralAmountHistorySchema: Schema = new Schema({
  bonus_from: { type: String, required: true },
  reference_bonus_amount: { type: Number, required: true },
  type: { type: String },
  date: { type: String },
})

const ReferralBonusHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  total_referral_history: { type: Number },
  referral_bonus_history: [ReferralAmountHistorySchema],
})

const ClubBonusDetailSchema: Schema = new Schema({
  club_bonus_amount: { type: Number, required: true },
  date: { type: String },
})

const ClubBonusHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  club_bonus_history: [ClubBonusDetailSchema],
})

const SendClubBonusTodaySchema: Schema = new Schema({
  club_bonus_amount: { type: Number, required: true },
  total_members: { type: Number, required: true },
  bonus_per_member: { type: Number, required: true },
  club_members: { type: [Schema.Types.ObjectId], required: true },
  date: { type: String },
})

// Export the AddMoney model
export const AddMoneyHistoryModel = model<IAddMoneyHistory & Document>(
  'AddMoneyHistory',
  AddMoneyHistorySchema,
)

// Export the MatchingBonus model
export const MatchingBonusHistoryModel = model<
  IMatchingBonusHistory & Document
>('MatchingBonusHistory', MatchingBonusHistorySchema)

// Export the ReferralBonus model
export const ReferralBonusHistoryModel = model<
  IReferralBonusHistory & Document
>('ReferralBonusHistory', ReferralBonusHistorySchema)

// Export the ClubBonus model
export const ClubBonusHistoryModel = model<IClubBonusHistory & Document>(
  'ClubBonusHistory',
  ClubBonusHistorySchema,
)

// Export the SendClubBonusToday model
export const SendClubBonusTodayModel = model<ISendClubBonusToday & Document>(
  'SendClubBonusToday',
  SendClubBonusTodaySchema,
)
