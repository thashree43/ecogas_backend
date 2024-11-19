import { Types } from "mongoose";
import {IUserRepository} from "../domain"
import { IUserData } from "../domain";

export class listorderusersideusecase {
    constructor(private UserRepositories: IUserRepository) {}
  
    async execute(id: Types.ObjectId | string): Promise<IUserData> {
      try {
        const orders = await this.UserRepositories.listorder(id);
        return orders;
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching orders");
      }
    }
  }