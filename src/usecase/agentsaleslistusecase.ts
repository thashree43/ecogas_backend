import { Types } from "mongoose";
import { IagentData, IAgentRepository } from "../domain";

export class agentsaleslistusecase{
    constructor(
private AgentRepository:IAgentRepository
    ){}
    async execute(agentId: string | Types.ObjectId): Promise<IagentData | null> {
        try {
          const data = await this.AgentRepository.agentgetsales(agentId);
          return data;
        } catch (error) {
          console.error("Error in AgentSalesListUsecase:", error);
          return null;
        }
      }

}