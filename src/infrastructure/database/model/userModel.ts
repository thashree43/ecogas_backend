import { Schema, model, Document, ObjectId, Types } from "mongoose";

export interface IUserData extends Document {
  messages: any[];
  products: any;
  _id:ObjectId;
  username: string;
  email: string;
  mobile: number | null;
  password: string;
  is_blocked: boolean;
  is_admin: boolean;
  is_verified: boolean;
  book:Types.ObjectId[]
  orders:Types.ObjectId[]
}

const userschema = new Schema<IUserData>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: false, default: null },
    password: { type: String, required: true },
    is_blocked: { type: Boolean, default: false },
    is_admin: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    book:[{type:Schema.Types.ObjectId,ref:"Bookdata"}],
    orders:[{type:Schema.Types.ObjectId,ref:"Orders"}],
  },
  {
    timestamps: true,
  }
);

export default model<IUserData>("User", userschema);
