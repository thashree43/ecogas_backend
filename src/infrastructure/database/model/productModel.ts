import { Schema, model, Document, Types } from "mongoose";

export interface IProductDocument extends Document {
  _id: Types.ObjectId;
  companyname: string;
  weight: number;
  price: number;
  quantity: number;
}

const productSchema = new Schema({
  companyname: { type: String, required: true },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

export const productModel = model<IProductDocument>("Product", productSchema);
