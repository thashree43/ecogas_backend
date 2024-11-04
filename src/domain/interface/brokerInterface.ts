import { Schema, Types } from "mongoose";
import { Agent, AgentProduct } from "../../domain";
import { IagentData, IOrderData, IProductDocument, IUserData } from ".././../infrastructure/database";
import { IDashboardData } from "../../infrastructure/types/interfaces";

export interface IAgentRepository {
  saveagent(agent: Agent): Promise<IagentData>;
  findemail(email: string): Promise<IagentData | null>;
  findByPincode(pincode: string): Promise<IagentData[]>;
  addproduct(productData: AgentProduct, agentId: string): Promise<IProductDocument | null>;
  getallproduct(agentId: Types.ObjectId): Promise<IProductDocument[]>;
  findbyid(_id: Schema.Types.ObjectId): Promise<IProductDocument | null>;
  updateProduct(id: string | Types.ObjectId, productData: Partial<IProductDocument>): Promise<IProductDocument | null>;
  deleteproduct(id: string | Types.ObjectId): Promise<IProductDocument | null>;
  getordersin(agentId: Types.ObjectId | string): Promise<IagentData | null>;
  updatestatus(id:Types.ObjectId | string):Promise<IOrderData | null>
  agentgetsales(agentId: string | Types.ObjectId): Promise<IagentData | null>
  agentdashboard(agentId: string | Types.ObjectId): Promise<IDashboardData| null>
}