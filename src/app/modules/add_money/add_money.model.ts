import { model, Schema, Document } from 'mongoose'
import { IAddMoney } from './add_money.interface'

const UserAccountableSchema: Schema = new Schema({
  total_project: { type: Number, required: true },
  total_project_amount: { type: Number, required: true },
  fixed_deposit: { type: Number, required: true },
  share_holder: { type: Number, required: true },
  directorship: { type: Number, required: true },
})

const AddMoneySchema: Schema = new Schema<IAddMoney>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    total_project: { type: Number, required: true },
    total_project_amount: { type: Number },
    fixed_deposit: { type: Number, required: true },
    share_holder: { type: Number, required: true },
    directorship: { type: Number, required: true },
    total_amount: { type: Number },
    total_point: { type: Number },

    user_accountable: [UserAccountableSchema],
  },
  {
    timestamps: true,
  },
)

export const AddMoneyModel = model<IAddMoney & Document>(
  'AddMoney',
  AddMoneySchema,
)
