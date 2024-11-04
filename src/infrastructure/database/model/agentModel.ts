import { Schema, model, Document, Types } from "mongoose";

export interface IagentData extends Document {
  _id: Schema.Types.ObjectId;
  agentname: string;
  email: string;
  mobile: number;
  password: string;
  pincode: number;
  is_Approved: boolean;
  image: string;
  products: Types.ObjectId[];
  orders: Types.ObjectId[];
}

const agentSchema = new Schema<IagentData>(
  {
    agentname: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true },
    pincode: { type: Number, required: true },
    is_Approved: { type: Boolean, default: false },
    image: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Orders" }]
  },
  { timestamps: true }
);

export const agentModel = model<IagentData>("Agent", agentSchema);