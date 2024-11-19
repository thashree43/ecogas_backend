import { Schema, Types } from "mongoose";

export interface IBookdata {
  _id?: Types.ObjectId;
  name: string;
  consumerid: number;
  mobile: number;
  address: string;
  company: string;
  gender: string;
}

export class BookData {
  _id?: Types.ObjectId;
  name: string;
  consumerid: number;
  mobile: number;
  address: string;
  company: string;
  gender: string;

  constructor({
    _id,
    name,
    consumerid,
    mobile,
    address,
    company,
    gender,
  }: IBookdata) {
    this._id = _id;
    this.name = name;
    this.consumerid = consumerid;
    this.mobile = mobile;
    this.address = address;
    this.company = company;
    this.gender = gender;
  }
}
