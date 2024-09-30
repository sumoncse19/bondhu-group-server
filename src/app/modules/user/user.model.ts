import { Schema, model } from 'mongoose'
import { IUser } from './user.interface'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    registration_date: {
      type: String,
      required: [true, 'Registration date is required'],
    },
    father_or_husband_name: { type: String },
    mother_name: { type: String },
    picture: { type: String },
    email: { type: String, required: true },
    user_name: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: 'bondhuGroup123456' },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(Roles), required: true },
    present_address: { type: String },
    permanent_address: { type: String },
    nationality: { type: String },
    religion: { type: String },
    blood_group: { type: String },
    nid_passport_no: { type: String, required: true, unique: true },
    dob: { type: String, required: true },
    choice_side: { type: String, enum: Object.values(Sides), required: true },
    marital_status: { type: String, enum: Object.values(MaritalStatus) },
    profession: { type: String },
    reference_id: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: true,
      validate: {
        validator: function (value: Schema.Types.ObjectId | string) {
          if (this.role === 'superAdmin') {
            return typeof value === 'string'
          }
          return (
            value instanceof Schema.Types.ObjectId || typeof value === 'string'
          )
        },
        message: (props) =>
          `Reference Id must be a needed for a user, but got ${typeof props.value}`,
      },
    },
    parent_placement_id: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: true,
      validate: {
        validator: function (value: Schema.Types.ObjectId | string) {
          if (this.role === 'superAdmin') {
            return typeof value === 'string'
          }
          return (
            value instanceof Schema.Types.ObjectId || typeof value === 'string'
          )
        },
        message: (props) =>
          `parent_placement_id must be a string when the role is 'superAdmin' but got ${typeof props.value}`,
      },
    },
    placement_id: { type: String, required: true, unique: true },
    left_side_partner: { type: String, default: null },
    right_side_partner: { type: String, default: null },
    accountable: { type: Object, default: {} },
    nominee_name: { type: String, required: true },
    relation_with_nominee: { type: String },
    nominee_address: { type: String },
    nominee_mobile_no: { type: String },
    nominee_picture: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

export const UserModel = model<IUser>('User', userSchema)
