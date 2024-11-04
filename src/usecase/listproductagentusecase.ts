import { Types } from "mongoose";
import { AgentRepository } from "../infrastructure/repository";

export class listingproductusecase {
  constructor(private IAgentRepositories: AgentRepository) {}

  async execute(agentId: string): Promise<any> {
    const objectIdAgentId = new Types.ObjectId(agentId);

    const data = await this.IAgentRepositories.getallproduct(objectIdAgentId);
    if (data.length === 0) { // Check for empty array
      throw new Error("No products found for this agent");
    }
    return data;
  }
}
