import { Schema, model, Document, Types } from "mongoose";

export interface IBookData extends Document {
  _id: Types.ObjectId;
  name: string;
  consumerid: number;
  mobile: number;
  address: string;
  company: string;
  gender: string;
}

const Bookschema = new Schema({
  name: { type: String, require: true },
  consumerid: { type: Number, required: true },
  mobile: { type: Number, required: true },
  address: { type: String, required: true },
  company: { type: String, required: true },
  gender: { type: String, required: true },
});

export const bookModel = model<IBookData>("Bookdata", Bookschema);
