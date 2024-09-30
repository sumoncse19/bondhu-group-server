import { model, Schema, Document } from 'mongoose'
import { IPurchaseMoney } from './purchase.interface'

const PurchaseAmountHistorySchema: Schema = new Schema({
  purchase_from: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  purchase_amount: { type: Number, required: true },
  date: { type: String },
})

const JoiningCostHistorySchema: Schema = new Schema({
  new_partner_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: String },
})

const PurchaseMoneySchema: Schema = new Schema<IPurchaseMoney>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    purchase_amount: { type: Number, required: true },
    purchase_amount_history: [PurchaseAmountHistorySchema],
    joining_cost_history: [JoiningCostHistorySchema],
  },
  {
    timestamps: true,
  },
)

export const PurchaseMoneyModel = model<IPurchaseMoney & Document>(
  'PurchaseMoney',
  PurchaseMoneySchema,
)
