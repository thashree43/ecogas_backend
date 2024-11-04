import { Types } from "mongoose";
import { User, BookData, OrderData, IChatData } from "../../domain";
import { IagentData, IBookData, IOrderData, IUserData } from "../../infrastructure/database";
import { IMessageData } from "../entities/messageentities";

export interface IUserRepository {
  getbyId(id: string): Promise<IUserData | null>;
  saveuser(user: User): Promise<IUserData>;
  findbyEmail(email: string): Promise<IUserData | null>;
  findByGoogleId(googleId: string): Promise<IUserData | null>;
  updatePassword(email: string, password: string): Promise<boolean>;
  savebook(book: BookData): Promise<IBookData>;
  linkbooktouser(userId: string, bookId: Types.ObjectId): Promise<void>;
  getbookbyid(userId: Types.ObjectId): Promise<IUserData | null>;
  deletebookbyid(bookId: Types.ObjectId | string): Promise<IBookData | null>;
  createOrder(selectedgasId:Types.ObjectId | string,order: Partial<OrderData>): Promise<IOrderData>;
  linkOrderToUser(
    userId: string | Types.ObjectId,
    orderId: string | Types.ObjectId
  ): Promise<IUserData | null>;
  linkOrderToProvider(
    selectedProviderId: string | Types.ObjectId,
    orderId: string | Types.ObjectId
  ): Promise<IagentData | null>;
  listorder(id:Types.ObjectId | string):Promise<IUserData>
  userchating(userId: Types.ObjectId | string): Promise<{ chatId: string; messages: any[]; user: IUserData }>;
  saveMessage(messagedata: any ): Promise<IMessageData>; // Add this line
  findmessagebyid(messageId: Types.ObjectId | string): Promise<IMessageData | null>;
  updateLatestMessage(chatId: Types.ObjectId | string, messageId: Types.ObjectId | string): Promise<void>;
  getmessages(chatid:Types.ObjectId | string ):Promise<IMessageData| null>
  updateOrder(orderId: Types.ObjectId | string, updateData: Partial<IOrderData>): Promise<IOrderData | null>;

}