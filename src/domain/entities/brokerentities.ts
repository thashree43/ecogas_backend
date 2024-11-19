import { Types } from "mongoose";

export interface IProductData {
  _id: Types.ObjectId;
  companyname: string;
  weight: number;
  price: number;
  quantity: number;
}

export interface IagentData {
  _id?: any;
  agentname: string;
  email: string;
  mobile: number;
  password: string;
  pincode: number;
  image: string;
  is_Approved?: boolean;
  products: Types.ObjectId[];
  orders:Types.ObjectId[]; // List of products associated with the agent
}

export class Agent {
  _id?: any;
  agentname: string;
  email: string;
  mobile: number;
  password: string;
  pincode: number;
  image: string;
  is_Approved: boolean;
  products: Types.ObjectId[];
  orders:Types.ObjectId[]; // Initializing it

  constructor(data: Partial<IagentData>) {
    this._id = data._id || new Types.ObjectId();
    this.agentname = data.agentname || "";
    this.email = data.email || "";
    this.mobile = data.mobile || 0;
    this.password = data.password || "";
    this.pincode = data.pincode || 0;
    this.is_Approved = data.is_Approved || false;
    this.image = data.image || "";
    this.products = data.products || [];
    this.orders = data.orders || [];
  }
}
