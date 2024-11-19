import { error } from "console";
import { agentModel, IagentData, IMessageData, IOrderData, IUserData, orderModel, userModel } from "../database";
import { IadminRepository, IChatData } from "../../domain";
import {ChatModel} from "../database/model/chatModel";
import messageModel from "../database/model/messageModel";
import { Types } from "mongoose";
import { Message } from "../../domain/entities/messageentities";

export class AdminRepository implements IadminRepository {
  constructor() {}
  async findbyEmail(email: string): Promise<IUserData | null> {
    return (await userModel.findOne({ email })) as IUserData;
  }
  async getall(): Promise<IUserData[] | null> {
    try {
      return await userModel.find().lean<IUserData[]>();
      console.log("hello here reached");
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
  async updatestatus(id: string, data: object): Promise<IUserData | null> {
    try {
      const updateduser = await userModel.findOneAndUpdate({ _id: id }, data, {
        new: true,
      });
      if (!updateduser) {
        throw new Error("the user may not found ");
      }
      return updateduser;
    } catch (error) {
      throw new Error("error in db while updating status in blocking the user");
    }
  }
 

  async getallagent(): Promise<IagentData[]> {
    try {
      return await agentModel.find();  // Fetching all agents from the database
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching agents");
    }
  }
  async updateApproval(id: string, data: object): Promise<IagentData | null> {
      try {
        const updateagentapproval = await agentModel.findOneAndUpdate({_id:id},data,{
            new:true
        })
        if (!updateagentapproval) {
            throw new Error("agent not found")
        }
        return updateagentapproval
      } catch (error) {
        throw new Error("there is some mistake may seems in while in the db model")
      }
  }
  async allorders(): Promise<IOrderData[]> {
    try {
      const data = await orderModel.find();
      return data;
    } catch (error) {
      console.error(error, "error occurred while getting orders");
      throw new Error("Error fetching orders");
    }
  }
  async getcustomers(): Promise<IChatData[]> {
    try {
      const datas = await ChatModel
        .find()
        .populate("user", "username email")
        .populate("latestmessage", "content createdAt")
        .sort({ updatedAt: -1 });
      return datas;
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching customers");
    }
  }
  async getMessages(chatId: string): Promise<IMessageData[]> {
    try {
      const messages = await messageModel.find({ chat: chatId })
        .sort({ createdAt: 1 })
        .populate('sender', 'username');
      return messages;
    } catch (error) {
      console.error(error);
      throw new Error("Error fetching messages");
    }
  }
  async saveMessage(messagedata: any): Promise<IMessageData> {
    try {
      // Ensure the data is in the correct format before saving
      const formattedData = {
        reciever: Array.isArray(messagedata.reciever) ? messagedata.reciever : [messagedata.reciever],
        sender: Array.isArray(messagedata.sender) ? messagedata.sender : [messagedata.sender],
        content: messagedata.content,
        chat: Array.isArray(messagedata.chat) ? messagedata.chat : [messagedata.chat],
        image: messagedata.image
      };

      const newMessage = new messageModel(formattedData);
      return await newMessage.save();
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, adminId: string, content: string): Promise<IMessageData> {
    try {
      const newMessage = await messageModel.create({
        reciever: [],
        sender: [adminId],
        content: content,
        chat: [chatId],
      });

      await ChatModel.findByIdAndUpdate(chatId, { latestmessage: newMessage._id });

      return newMessage;
    } catch (error) {
      console.error(error);
      throw new Error("Error sending message");
    }
  }

  async updateLatestMessage(chatId: Types.ObjectId | string, messageId: Types.ObjectId | string): Promise<void> {
    await ChatModel.findByIdAndUpdate(
        chatId,
        { $push: { latestmessage: messageId } }, 
        { new: true } 
    );
  }
  async getsales(): Promise<IagentData[] | null> {
      try {
        const datas = await agentModel.find().populate("orders");
        return datas

      } catch (error) {
        console.error(error,"the error while sales listing");
        throw new Error("errors ooccured in ")
        
      }
  }
  async getTotalOrdersCount(): Promise<number> {
    return orderModel.countDocuments({ status: "delivered" });
  }

  async getTotalOrdersAndProfit(): Promise<{ totalOrdersAmount: number; totalProfit: number }> {
    try {
      const deliveredOrders = await orderModel.find({ status: "delivered" });
      const { totalOrdersAmount, totalProfit } = deliveredOrders.reduce(
        (totals, order) => {
          totals.totalOrdersAmount += order.price;
          totals.totalProfit += order.price * 0.04;
          return totals;
        },
        { totalOrdersAmount: 0, totalProfit: 0 }
      );
      return { totalOrdersAmount, totalProfit };
    } catch (error) {
      console.error("Error calculating total orders and profit:", error);
      throw new Error("Error calculating totals.");
    }
  }

  async getTotalAgentCount(): Promise<number> {
    return agentModel.countDocuments({});
  }

  async getMonthlySales(): Promise<{ month: string; totalOrders: number; totalProfit: number;totalOrdersAmount: number }[]> {
    return orderModel.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalProfit: { $sum: { $multiply: ["$price", 0.04] } },
          totalOrdersAmount: { $sum: "$price" }  

        }
      },
      {
        $project: {
          month: { $toString: "$_id.month" },
          totalOrders: 1,
          totalProfit: 1,
          totalOrdersAmount: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
  }

}
