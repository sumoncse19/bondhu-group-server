import { model, Schema, Document } from 'mongoose'
import { IWithdrawMoney } from './withdraw.interface'
import { PaymentMethod } from '../shared/add_money.enumeration'

const WithdrawMoneySchema: Schema = new Schema<IWithdrawMoney>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    payment_method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    account_no: { type: String, required: true },
    bank_name: {
      type: String,
      required: function () {
        return this.payment_method === 'bank'
      },
    },
    bank_branch: {
      type: String,
      required: function () {
        return this.payment_method === 'bank'
      },
    },
    routing_no: {
      type: String,
      required: function () {
        return this.payment_method === 'bank'
      },
    },
    swift_code: {
      type: String,
      required: function () {
        return this.payment_method === 'bank'
      },
    },
    withdraw_amount: { type: Number, required: true },
    security_code: { type: Number, required: true },
    withdraw_wallet: {
      type: String,
      required: true,
      enum: [
        'income_wallet',
        'share_return',
        'fixed_deposit',
        'share_holder',
        'directorship',
      ],
    },
    withdraw_status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    is_withdrawn: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const WithdrawMoneyModel = model<IWithdrawMoney & Document>(
  'WithdrawMoney',
  WithdrawMoneySchema,
)
