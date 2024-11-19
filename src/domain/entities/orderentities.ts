import { Schema, Types } from "mongoose";

export interface IOrderData {
  _id?: Types.ObjectId;
  name: string;
  address: string;
  mobile: number;
  consumerid: number;
  company: string;
  price: number;
  paymentmethod: string;
  expectedat: Date;
  status: string;
}

export class OrderData {
  _id?: Types.ObjectId;
  name: string;
  address: string;
  mobile: number;
  consumerid: number;
  company: string;
  price: number;
  paymentmethod: string;
  expectedat: Date;
  status: string;

  constructor(
 {   _id,
    name,
    address,
    mobile,
    consumerid,
    company,
    price,
    paymentmethod,
    expectedat,
    status}:IOrderData
  ) {
this._id = _id,
this.name = name,
this.address = address,
this.mobile = mobile,
this.consumerid = consumerid,
this.company = company,
this.price = price ,
this.paymentmethod = paymentmethod,
this.expectedat = expectedat,
this.status = status;
  }
}
