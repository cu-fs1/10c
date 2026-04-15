import { Schema, Document, Types, models, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string; // hashed
}

export interface IUserDocument extends IUser, Document {}

export interface IUserLean extends IUser {
  _id: Types.ObjectId;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const User = models.User ?? model<IUserDocument>("User", UserSchema);

export default User;
