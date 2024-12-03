import { model, Schema, Document } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'
import {
  IDirectorshipPayment,
  IFixedDepositPayment,
  IProjectSharePayment,
  IShareHolderPayment,
} from './wallet.interface'

const ProjectSharePaymentSchema: Schema = new Schema<IProjectSharePayment>({
  userId: {
    type: Schema.Types.Mixed,
    required: true,
    ref: 'User',
  },
  name: { type: String, required: true },
  user_name: { type: String, required: true },
  payment_method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  add_money_history_id: {
    type: Schema.Types.Mixed,
    required: true,
    ref: 'AddMoneyHistory',
  },
  money_receipt_number: { type: String, required: true },
  project_share_amount: { type: Number, required: true },
  profit_amount: { type: Number, default: 0 },
  payment_count: { type: Number, default: 0 },
  payment_date: { type: String, required: true },
  payment_send_date: { type: String },
  is_paid: { type: Boolean, default: false },
})

const FixedDepositPaymentSchema: Schema = new Schema<IFixedDepositPayment>({
  userId: {
    type: Schema.Types.Mixed,
    required: true,
    ref: 'User',
  },
  name: { type: String, required: true },
  user_name: { type: String, required: true },
  payment_method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  add_money_history_id: {
    type: Schema.Types.Mixed,
    required: true,
    ref: 'AddMoneyHistory',
  },
  money_receipt_number: { type: String, required: true },
  fixed_deposit_amount: { type: Number, required: true },
  profit_amount: { type: Number, default: 0 },
  payment_count: { type: Number, default: 0 },
  payment_date: { type: String, required: true },
  payment_send_date: { type: String },
  is_paid: { type: Boolean, default: false },
})

const ShareHolderPaymentSchema: Schema = new Schema<IShareHolderPayment>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    user_name: { type: String, required: true },
    payment_method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    add_money_history_id: {
      type: Schema.Types.Mixed,
      required: true,
      ref: 'AddMoneyHistory',
    },
    money_receipt_number: { type: String, required: true },
    share_holder_amount: { type: Number, required: true },
    profit_amount: { type: Number, default: 0 },
    payment_date: { type: String, required: true },
    payment_send_date: { type: String },
    is_paid: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const DirectorshipPaymentSchema: Schema =
  new Schema<IDirectorshipPayment>(
    {
      userId: {
        type: Schema.Types.Mixed,
        required: true,
        ref: 'User',
      },
      name: { type: String, required: true },
      user_name: { type: String, required: true },
      payment_method: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: true,
      },
      add_money_history_id: {
        type: Schema.Types.Mixed,
        required: true,
        ref: 'AddMoneyHistory',
      },
      money_receipt_number: { type: String, required: true },
      directorship_amount: { type: Number, required: true },
      profit_amount: { type: Number, default: 0 },
      payment_date: { type: String, required: true },
      payment_send_date: { type: String },
      is_paid: { type: Boolean, default: false },
    },
    {
      timestamps: true,
    },
  )

export const ProjectSharePaymentModel = model<IProjectSharePayment & Document>(
  'ProjectSharePayment',
  ProjectSharePaymentSchema,
)

export const FixedDepositPaymentModel = model<IFixedDepositPayment & Document>(
  'FixedDepositPayment',
  FixedDepositPaymentSchema,
)

export const ShareHolderPaymentModel = model<IShareHolderPayment & Document>(
  'ShareHolderPayment',
  ShareHolderPaymentSchema,
)

export const DirectorshipPaymentModel = model<IDirectorshipPayment & Document>(
  'DirectorshipPayment',
  DirectorshipPaymentSchema,
)
