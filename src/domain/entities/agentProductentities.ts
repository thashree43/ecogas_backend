import { Schema, Types } from "mongoose";

export interface IAgentProductData {
  _id?: Types.ObjectId;
  companyname: string;
  weight: number;
  price: number;
  quantity: number;
}

export class AgentProduct {
  _id?: Types.ObjectId;
  companyname: string;
  weight: number;
  price: number;
  quantity: number;

  constructor({
    _id,
    companyname,
    weight,
    price,
    quantity,
  }: IAgentProductData) {
    this._id = _id;
    this.companyname = companyname;
    this.weight = weight;
    this.price = price;
    this.quantity = quantity;
  }
}
