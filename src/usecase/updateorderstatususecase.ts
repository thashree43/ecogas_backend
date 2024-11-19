import { Types } from "mongoose";
import { IOrderData } from "../domain";
import { IAgentRepository } from "../domain";

export class updateorderstatususecase {
  constructor(private AgentRepositories: IAgentRepository) {}

  async execute(id: Types.ObjectId | string): Promise<IOrderData | null> {
    try {
      const res = await this.AgentRepositories.updatestatus(id);
      return res;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}