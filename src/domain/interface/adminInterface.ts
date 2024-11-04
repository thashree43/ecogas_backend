// src/infrastructure/repository/interface/adminInterface.ts
import { Types } from "mongoose";
import { IagentData, IMessageData, IOrderData, IUserData } from "../../infrastructure/database";
import { IChatData } from "../entities/chatentities";

export interface IadminRepository {
    findbyEmail(email: string): Promise<IUserData | null>;
    getall(): Promise<IUserData[] | null>;
    updatestatus(id: string, data: object): Promise<IUserData | null>;
    getallagent(): Promise<IagentData[] | null>;
    updateApproval(id:string,data:object):Promise<IagentData | null>
    allorders(): Promise<IOrderData[]>;
    getcustomers():Promise<IChatData[] | null>
    getMessages(chatId: string): Promise<IMessageData[]>;
    sendMessage(chatId: string, adminId: string, content: string): Promise<IMessageData>;
    updateLatestMessage(chatId: Types.ObjectId | string, messageId: Types.ObjectId | string): Promise<void>;
    saveMessage(messagedata: any): Promise<IMessageData>;
    getsales():Promise<IagentData[] | null>;
      // New methods for the dashboard
      getTotalOrdersCount(): Promise<number>;
    getTotalOrdersAndProfit(): Promise<{ totalOrdersAmount: number; totalProfit: number }>;
    getTotalAgentCount(): Promise<number>;
    getMonthlySales(): Promise<{ month: string; totalOrders: number; totalProfit: number;totalOrdersAmount: number }[]>;
      
}
