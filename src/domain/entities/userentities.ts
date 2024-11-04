import { Types } from "mongoose";

export interface IUserData {
  _id?: any;
  username: string;
  email: string;
  mobile: number | null;
  password: string;
  is_blocked?: boolean;
  is_admin?: boolean;
  is_verified?: boolean;
  book: Types.ObjectId[];
  orders:Types.ObjectId[];
}
export class User implements Omit<IUserData, keyof Document> {
  _id?: any;
  username: string;
  email: string;
  mobile: number | null;
  password: string;
  is_blocked: boolean;
  is_admin: boolean;
  is_verified: boolean;
  book: Types.ObjectId[];
  orders:Types.ObjectId[];

  constructor(data: Partial<IUserData>) {
    this._id = data._id;
    this.username = data.username!;
    this.email = data.email!;
    this.mobile = data.mobile!;
    this.password = data.password!;
    this.is_blocked = data.is_blocked ?? false;
    this.is_admin = data.is_admin ?? false;
    this.is_verified = data.is_verified ?? false;
    this.book = data.book || []; 
    this.orders = data.orders || [];
  }

  toIUserData(): IUserData {
    return {
      _id: this._id,
      username: this.username,
      email: this.email,
      mobile: this.mobile,
      password: this.password,
      is_blocked: this.is_blocked,
      is_admin: this.is_admin,
      is_verified: this.is_verified,
      book: this.book, 
      orders:this.orders
    };
  }
}
