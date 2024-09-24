import { Schema, model } from 'mongoose'
import { IUser } from './user.interface'
import { MaritalStatus, Roles, Sides } from '../shared/user.enumeration'

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    father_or_husband_name: { type: String },
    mother_name: { type: String },
    picture: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(Roles), required: true },
    present_address: { type: String },
    permanent_address: { type: String },
    nationality: { type: String },
    religion: { type: String },
    blood_group: { type: String },
    nid_passport_no: { type: String, required: true },
    dob: { type: String, required: true },
    choice_side: { type: String, enum: Object.values(Sides), required: true },
    marital_status: { type: String, enum: Object.values(MaritalStatus) },
    profession: { type: String },
    reference_id: { type: String, required: true },
    placement_id: { type: String, required: true, unique: true },
    nominee_name: { type: String, required: true },
    relation_with_nominee: { type: String },
    nominee_address: { type: String, required: true },
    nominee_mobile_no: { type: String, required: true },
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
