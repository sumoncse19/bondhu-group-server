import { model, Schema, Document } from 'mongoose'
import { PaymentMethod } from '../shared/add_money.enumeration'
import { IDirectorshipPayment, IShareHolderPayment } from './wallet.interface'

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
    payment_date: { type: String, required: true },
    payment_send_date: { type: String },
    profit_amount: { type: Number, default: 0 },
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
      payment_date: { type: String, required: true },
      payment_send_date: { type: String },
      profit_amount: { type: Number, default: 0 },
      is_paid: { type: Boolean, default: false },
    },
    {
      timestamps: true,
    },
  )

export const ShareHolderPaymentModel = model<IShareHolderPayment & Document>(
  'ShareHolderPayment',
  ShareHolderPaymentSchema,
)

export const DirectorshipPaymentModel = model<IDirectorshipPayment & Document>(
  'DirectorshipPayment',
  DirectorshipPaymentSchema,
)
