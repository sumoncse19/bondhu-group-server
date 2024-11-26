import { Schema, model } from 'mongoose'
import { IUser } from './user.interface'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    serial_number: { type: String, required: true, unique: true },
    registration_date: {
      type: String,
      required: [true, 'Registration date is required'],
    },
    father_or_husband_name: { type: String },
    mother_name: { type: String },
    picture: { type: String },
    cover_photo: { type: String },
    email: { type: String, required: true },
    user_name: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: 'bgbd123456' },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(Roles), required: true },
    present_address: { type: String },
    permanent_address: { type: String },
    nationality: { type: String },
    religion: { type: String },
    blood_group: { type: String },
    nid_passport_no: { type: String, required: true, unique: true },
    dob: { type: String },
    choice_side: { type: String, enum: Object.values(Sides), required: true },
    marital_status: { type: String, enum: Object.values(MaritalStatus) },
    profession: { type: String },
    agent_id: { type: Schema.Types.Mixed, ref: 'User' },
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
    left_side_partner: { type: Schema.Types.Mixed, default: null },
    right_side_partner: { type: Schema.Types.Mixed, default: null },
    accountable: {
      type: Object,
      default: {
        project_share: 0,
        fixed_deposit: 0,
        share_holder: 0,
        directorship: 0,
        total_amount: 0,
        team_a_member: 0,
        team_b_member: 0,
        team_a_point: 0,
        team_b_point: 0,
        total_point: 0,
        team_a_carry: 0,
        team_b_carry: 0,
        total_carry: 0,
      },
    },
    wallet: {
      type: Object,
      default: {
        income_wallet: 0,
        reference_bonus: 0,
        matching_bonus: 0,
        club_bonus: 0,
        purchase_wallet: 0,
        project_share_wallet: 0,
        fixed_deposit_wallet: 0,
        share_holder_wallet: 0,
        directorship_wallet: 0,
      },
    },
    bKash: { type: String },
    rocket: { type: String },
    nagad: { type: String },
    bank_name: { type: String },
    bank_account_name: { type: String },
    branch_name: { type: String },
    account_no: { type: String },
    routing_no: { type: String },
    swift_code: { type: String },
    security_code: { type: String, default: null },
    designation: { type: String, default: '' },
    is_approved: { type: Boolean, default: false },
    nominee_name: { type: String, required: true },
    relation_with_nominee: { type: String },
    nominee_address: { type: String },
    nominee_mobile_no: { type: String },
    nominee_picture: { type: String },
    note: { type: String },
    note_image: { type: String },
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
